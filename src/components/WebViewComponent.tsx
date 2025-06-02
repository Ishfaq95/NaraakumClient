import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
  Linking,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import {WebView} from 'react-native-webview';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import messaging from '@react-native-firebase/messaging';
import {useDispatch, useSelector} from 'react-redux';
import {setTopic, setUser} from '../shared/redux/reducers/userReducer';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import useMutationHook from '../Network/useMutationHook';
import PushNotification from 'react-native-push-notification';
import notifee, {
  AndroidImportance,
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import {ROUTES} from '../shared/utils/routes';
import {useNavigation} from '@react-navigation/native';
import WebSocketService from './WebSocketService';

const WebViewComponent = ({uri}: any) => {
  const dispatch = useDispatch();
  const {topic, user} = useSelector((state: any) => state.root.user);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(uri);
  const [userInformation, setUserInformation] = useState('');
  const [reloadWebView, setReloadWebView] = useState(false);
  const [latestUrl, setLatestUrl] = useState('');
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const webSocketService = WebSocketService.getInstance();

  const sleep = (timeout: number) =>
    new Promise<void>(resolve => setTimeout(resolve, timeout));

  const {
    mutate: getSystemNotificationFN,
    isSuccess: isSuccessSystemNotification,
    isError: isErrorSystemNotifiction,
    data: SystemNotificationList,
    isLoading: isLoadingSystemNotification,
  } = useMutationHook('reminders/GetSystemReminderList', 'POST');

  useEffect(() => {
    if (isSuccessSystemNotification) {
      PushNotification.cancelAllLocalNotifications();

      if (Platform.OS === 'ios') {
        scheduleNotificationIOS(SystemNotificationList?.ReminderList);
      } else {
        scheduleNotificationAndroid(SystemNotificationList?.ReminderList);
      }
    }
    if (isErrorSystemNotifiction) {
    }
  }, [isSuccessSystemNotification, isErrorSystemNotifiction]);

  const scheduleNotificationIOS = (notificationList: any) => {
    notificationList.map((item: any, index: any) => {
      const data = item;
      // Convert UTC date string to local Date object
      const localDate = new Date(data.ReminderDate); // Date object auto-adjusts to local timezone

      // Optional: skip past dates
      if (localDate <= new Date()) {
        return;
      }

      const reminderObj = {
        ...item,
        meetingInfo: item.meetingInfo[0],
        notificationFrom: 'reminder',
      };

      PushNotification.localNotificationSchedule({
        id: data.Id,
        title: data.Subject,
        message: data.NotificationBody,
        date: localDate,
        // date: new Date(Date.now() + 60 * 1000),
        playSound: true,
        soundName: 'default',
        userInfo: reminderObj,
        allowWhileIdle: true, // important for background
      });
    });

    PushNotification.getScheduledLocalNotifications(notifs => {});
  };

  const scheduleNotificationAndroid = async (notificationList: any) => {
    await notifee.cancelAllNotifications();

    try {
      for (const item of notificationList) {
        const localDate = new Date(item.ReminderDate);

        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: localDate.getTime(), // cleaner and safer
        };
        await notifee.createTriggerNotification(
          {
            id: `reminder-${item.Id}`,
            title: item.Subject || 'Reminder',
            body: item.NotificationBody || 'You have a reminder',
            android: {
              channelId: 'default',
              pressAction: {
                id: 'default',
              },
            },
            data: {
              CatNotificationPlatformId: item.CatNotificationPlatformId,
              CreatedDate: item.CreatedDate,
              Id: item.Id,
              NotificationBody: item.NotificationBody,
              ReceiverId: item.ReceiverId,
              ReminderDate: item.ReminderDate,
              SchedulingDate: item.SchedulingDate,
              SchedulingTime: item.SchedulingTime,
              Subject: item.Subject,
              TaskId: item.TaskId,
              VideoSDKMeetingId: item.VideoSDKMeetingId || 'Not Found',
              notificationFrom: 'reminder',
              meetingInfo: item.meetingInfo[0],
            },
          },
          trigger,
        );
      }

      const notifeeNotifs = await notifee.getTriggerNotifications();
    } catch (error) {}
  };

  useEffect(() => {
    if (user) {
      getSystemNotificationFN({
        UserloginInfo: user.id,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const presence = 1;
      const communicationKey = user.communicationKey;
      const UserId = user.id;
      webSocketService.connect(presence, communicationKey, UserId);
    } else {
      webSocketService.disconnect();
    }
  }, [user]);

  const subsribeTopic = (Id: any) => {
    const topicName = `patient_${Id}`;

    if (topic) {
      if (topic != topicName) {
        messaging()
          .unsubscribeFromTopic(topic)
          .then(() => {});

        dispatch(setTopic(topicName));

        messaging()
          .subscribeToTopic(topicName)
          .then(() => {});
      }
    } else {
      dispatch(setTopic(topicName));
      messaging()
        .subscribeToTopic(topicName)
        .then(() => {});
    }
  };

  const injectedJavaScript = `
    (function() {
      // Helper function to log messages to React Native
      function logToReactNative(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ log: message }));
      }

      // Function to send token and user info to React Native app
      function sendTokenAndUserInfoToReactNativeApp() {
        try {
          var token = NK.Common.webAPIAccessToken;
          var userInfo = NK.Common.getLoggedInUser();
          var data = { token: token };
          if (userInfo) {
            data.userInfo = userInfo;
          }
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        } catch (error) {
          logToReactNative("Error in sendTokenAndUserInfoToReactNativeApp: " + error.message);
        }
      }

      // Overwrite window.open to send the full URL and query params to React Native app
      window.open = function(url) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ url: url }));
      };

      // Call the function to send token and user info immediately
      sendTokenAndUserInfoToReactNativeApp();
    })();
    true;
  `;

  const getFileNameFromUrl = (url: any) => {
    // Split the URL by '/'
    const parts = url.split('/');
    // Get the last part, which is the filename
    return parts.pop();
  };

  const handleMessage = async (event: any) => {
    const {
      url,
      userInfo,
      event: eventHandler,
      data,
      fileName,
    } = JSON.parse(event.nativeEvent.data);

    if (eventHandler == 'logout') {
      // dispatch(setUser(null));
      dispatch(setTopic(null));
      webSocketService.disconnect();
    }

    if (eventHandler == 'joinMeeting') {
      navigation.navigate(ROUTES.preViewCall, {Data: data});
    } else if (eventHandler == 'orderSuccess') {
      getSystemNotificationFN({
        UserloginInfo: user.id,
      });
    } else if (eventHandler == 'download') {
      let isPermissionGrandted = await getStoragePermission();
      if (isPermissionGrandted) {
        setLoading(true);
        let pdfUrl = data;
        let fileName = getFileNameFromUrl(pdfUrl);
        if (Platform.OS === 'ios') {
          downloadFIleForIOS(pdfUrl, fileName);
        } else {
          downloadFile(pdfUrl, fileName);
        }
      } else {
        showAlert(
          'Allow Media Access.',
          'Allow media access to download the file.',
        );
      }

      return;
    } else if (eventHandler == 'downloadFromBase64') {
      let isPermissionGrandted = await getStoragePermission();
      if (isPermissionGrandted) {
        setLoading(true);
        downloadPDFFromBase64(data, fileName);
      } else {
        showAlert(
          'Allow Media Access.',
          'Allow media access to download the file.',
        );
      }
    } else if (eventHandler == 'userLoggedIn') {
      const userInfo = data;
      setUserInformation(userInfo);
      subsribeTopic(userInfo.id);
      // dispatch(setUser(userInfo));
    }

    // if (url && url.includes('OnlineSessionRoom')) {
    //   // let urlComplete = `https://staging.innotech-sa.com${url}`;
    //   let urlComplete = `https://dvx.innotech-sa.com${url}`;
    //   // let urlComplete = `https://nkapps.innotech-sa.com${url}`;
    //   // let urlComplete = `https://naraakum.com${url}`;

    //   const redirectUrl = getDeepLink();

    //   try {
    //     if (await InAppBrowser.isAvailable()) {
    //       // const result = await InAppBrowser.open(urlComplete, {
    //       //   showTitle: true,
    //       //   toolbarColor: '#6200EE',
    //       //   enableDefaultShare: true,
    //       //   animations: {
    //       //     startEnter: 'slide_in_right',
    //       //     startExit: 'slide_out_left',
    //       //     endEnter: 'slide_in_left',
    //       //     endExit: 'slide_out_right',
    //       //   },
    //       // });
    //       const result = await InAppBrowser.open(urlComplete, {
    //         forceCloseOnRedirection: false,
    //         showInRecents: true,
    //         showTitle: true,
    //         enableUrlBarHiding: true,
    //         enableDefaultShare: false,
    //         modalPresentationStyle: 'overFullScreen',

    //         ephemeralWebSession: false,
    //         enableBarCollapsing: true,
    //         modalEnabled: true,
    //       });
    //       await sleep(800);
    //       setCurrentUrl(latestUrl);
    //       setReloadWebView(true);
    //       setTimeout(() => {
    //         setReloadWebView(false);
    //       }, 100);
    //     }
    //   } catch (error) {
    //     Alert.alert('Error', 'Failed to open the in-app browser');
    //   }
    // }
  };

  const getDeepLink = (path = '') => {
    const scheme = 'naraakum-client';
    const prefix =
      Platform.OS === 'android'
        ? `${scheme}://redirectClient/`
        : `${scheme}://`;
    return prefix + path;
  };

  const downloadFIleForIOS = (url: any, fileName: any) => {
    const {config, fs} = RNFetchBlob;
    const DocumentDir = fs.dirs.DocumentDir; // Use DocumentDir for iOS
    const filePath = `${DocumentDir}/${fileName}`; // Set the file path to DocumentDir for iOS

    // Use config to set the download path and file handling
    config({
      fileCache: true,
      path: filePath, // Use the correct file path
    })
      .fetch('GET', url)
      .then(res => {
        setLoading(false);
        Alert.alert(
          'File downloaded successfully',
          'The file is saved to your device.',
        );

        // Optional: Preview the document after downloading
        RNFetchBlob.ios.previewDocument(filePath); // Preview the downloaded document on iOS
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('File downloading error.');
      });
  };

  const downloadFile = (url: any, fileName: any) => {
    const {config, fs} = RNFetchBlob;
    const DownloadDir = fs.dirs.DownloadDir;
    // Create a path where the file will be saved
    const filePath = `${DownloadDir}/${fileName}`;

    // Use config to set the download path and mime type
    config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: fileName,
        path: filePath,
      },
    })
      .fetch('GET', url)
      .then(res => {
        setLoading(false);
        Alert.alert('File downloaded successfully');
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('File downloading error.');
      });
  };

  const getUniqueFilePath = async (filePath: any) => {
    const extension = filePath.substring(filePath.lastIndexOf('.'));
    const fileNameWithoutExtension = filePath.substring(
      0,
      filePath.lastIndexOf('.'),
    );
    let uniqueFilePath = filePath;
    let counter = 1;

    while (await RNFetchBlob.fs.exists(uniqueFilePath)) {
      uniqueFilePath = `${fileNameWithoutExtension}(${counter})${extension}`;
      counter++;
    }

    return uniqueFilePath;
  };

  const downloadPDFFromBase64 = async (base64: string, fileName: any) => {
    const base64String = base64;
    const base64Data = base64String.split(',')[1]; // Remove data URL prefix if present
    let filePath = null;

    if (Platform.OS == 'ios') {
      filePath = `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}.pdf`;
    } else {
      filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.pdf`;
    }
    const uniqueFilePath = await getUniqueFilePath(filePath);

    RNFetchBlob.fs
      .writeFile(uniqueFilePath, base64Data, 'base64')
      .then(async () => {
        setLoading(false);
        Alert.alert('File downloaded successfully.');
        if (Platform.OS == 'ios') {
          RNFetchBlob.ios.previewDocument(filePath); // Preview the downloaded document on iOS
        }
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('File downloading error.');
      });
  };

  const showAlert = (title: any, body: any) => {
    Alert.alert(title, body);
  };

  const getStoragePermission = async () => {
    if (Platform.OS === 'ios') {
      return requestiOSPermissions();
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      if (
        granted['android.permission.READ_MEDIA_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        return false;
      }
    }
  };
  const handleLoadError = (event: any) => {
    setLoading(false);
    setReloadWebView(true);
    setTimeout(() => {
      setReloadWebView(false);
    }, 100);
  };

  const requestiOSPermissions = async () => {
    const photoLibraryPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    const mediaLibraryPermission = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);

    if (
      photoLibraryPermission === RESULTS.GRANTED &&
      mediaLibraryPermission === RESULTS.GRANTED
    ) {
      return true;
    } else {
      return false;
    }
  };

  const onNavigationStateChange = (url: any) => {
    if (isNonSocialMediaUrl(url.url)) {
      setLatestUrl(url.url);
    } else {
      setLoading(false);
    }
  };

  const handleLoadEnd = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectedJavaScript);
    }
  };

  const isNonSocialMediaUrl = (url: string): boolean => {
    const socialMediaDomains = [
      'youtube.com',
      'youtu.be',
      'x.com',
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'tiktok.com',
      'linkedin.com',
      'snapchat.com',
      'pinterest.com',
      'reddit.com',
    ];

    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl.includes('www.facebook.com') && Platform.OS == 'ios') {
      Linking.openURL(lowerCaseUrl);
      return false;
    } else {
      const match = lowerCaseUrl.match(/https?:\/\/(www\.)?([^\/]+)/);
      const domain = match ? match[2] : null;
      // Check if the extracted domain matches any social media domain
      return !socialMediaDomains.some(socialDomain =>
        domain?.includes(socialDomain),
      );
    }
  };

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState == 'inactive') {
        setLoading(false);
      }
    };

    // Add event listener
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Clean up the event listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        {reloadWebView ? (
          <View style={styles.loader}>
            <LoaderKit
              style={{width: 100, height: 100}}
              name={'BallSpinFadeLoader'}
              color={'green'}
            />
          </View>
        ) : Platform.OS === 'ios' ? (
          <WebView
            ref={webViewRef}
            source={{uri: currentUrl}}
            useWebKit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
              handleLoadEnd();
            }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            setSupportMultipleWindows={true} // Enable multiple windows on Android
            // userAgent={Platform.OS === 'android' ? 'Chrome/18.0.1025.133 Mobile Safari/535.19' : 'AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75'}
            userAgent={
              'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'
            }
            originWhitelist={['https://*', 'http://*', 'file://*', 'sms://*']}
            geolocationEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            onError={handleLoadError}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{uri: currentUrl}}
            useWebKit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
              handleLoadEnd();
            }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            setSupportMultipleWindows={true} // Enable multiple windows on Android
            // userAgent={Platform.OS === 'android' ? 'Chrome/18.0.1025.133 Mobile Safari/535.19' : 'AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75'}
            userAgent={
              'Mozilla/5.0 (Linux; Android 10; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0'
            }
            originWhitelist={['https://*', 'http://*', 'file://*', 'sms://*']}
            geolocationEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            onError={handleLoadError}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
          />
        )}
      </View>
      {loading && (
        <View style={styles.loader}>
          <LoaderKit
            style={{width: 100, height: 100}}
            name={'BallSpinFadeLoader'}
            color={'green'}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
});

export default WebViewComponent;
