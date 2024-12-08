import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import {WebView} from 'react-native-webview';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import messaging from '@react-native-firebase/messaging';
import {useDispatch, useSelector} from 'react-redux';
import {setTopic} from '../shared/redux/reducers/userReducer';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';

const WebViewComponent = ({uri}: any) => {
  const dispatch = useDispatch();
  const {topic} = useSelector((state: any) => state.root.user);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(uri);
  const [userInformation, setUserInformation] = useState('');
  const [reloadWebView, setReloadWebView] = useState(false);
  const [latestUrl, setLatestUrl] = useState('');
  const webViewRef = useRef(null);

  const sleep = (timeout: number) =>
    new Promise<void>(resolve => setTimeout(resolve, timeout));

  console.log('topic', topic);
  const subsribeTopic = (Id: any) => {
    const topicName = `patient_${Id}`;
    console.log('topicName', topicName);
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
      console.log('subscribe');
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

    if (eventHandler == 'download') {
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
    }

    if (url && url.includes('OnlineSessionRoom')) {
      // let urlComplete = `https://staging.innotech-sa.com${url}`;
      // let urlComplete = `https://dvx.innotech-sa.com${url}`;
      // let urlComplete = `https://nkapps.innotech-sa.com${url}`;
      let urlComplete = `https://naraakum.com${url}`;

      const redirectUrl = getDeepLink();

      try {
        if (await InAppBrowser.isAvailable()) {
          // const result = await InAppBrowser.open(urlComplete, {
          //   showTitle: true,
          //   toolbarColor: '#6200EE',
          //   enableDefaultShare: true,
          //   animations: {
          //     startEnter: 'slide_in_right',
          //     startExit: 'slide_out_left',
          //     endEnter: 'slide_in_left',
          //     endExit: 'slide_out_right',
          //   },
          // });
          const result = await InAppBrowser.open(urlComplete, {
            forceCloseOnRedirection: false,
            showInRecents: true,
            showTitle: true,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            modalPresentationStyle: 'overFullScreen',

            ephemeralWebSession: false,
            enableBarCollapsing: true,
            modalEnabled: true,
          });
          await sleep(800);
          setCurrentUrl(latestUrl);
          setReloadWebView(true);
          setTimeout(() => {
            setReloadWebView(false);
          }, 100);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open the in-app browser');
      }
    }
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
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      if (
        (granted['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_VIDEO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED) ||
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
      console.log('All necessary permissions granted');
      return true;
    } else {
      console.log('Some permissions were denied');
      return false;
    }
  };

  const onNavigationStateChange = (url: any) => {
    if (isNonSocialMediaUrl(url.url)) {
      setLatestUrl(url.url);
    } else {
      setLoading(false);
    }
    setLatestUrl(url.url);
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

    // Use stricter domain matching by extracting the host
    const match = lowerCaseUrl.match(/https?:\/\/(www\.)?([^\/]+)/);
    const domain = match ? match[2] : null;

    // Check if the extracted domain matches any social media domain
    return !socialMediaDomains.some(socialDomain =>
      domain?.includes(socialDomain),
    );
  };

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      console.log('App State changed to:', nextAppState);
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
        ) : (
          <WebView
            source={{uri: currentUrl}}
            useWebKit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={false}
            cacheMode={'LOAD_CACHE_ELSE_NETWORK'}
            onLoadStart={() => {
              setLoading(true);
            }}
            onLoadEnd={() => {
              setLoading(false);
            }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            // originWhitelist={['*']}
            userAgent={
              Platform.OS === 'android'
                ? 'Mozilla/5.0 (Linux; Android 10; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0'
                : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15'
            }
            // originWhitelist={["https://*", "http://*", "file://*", "sms://*"]}
            originWhitelist={['*']}
            geolocationEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={injectedJavaScript}
            injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
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
