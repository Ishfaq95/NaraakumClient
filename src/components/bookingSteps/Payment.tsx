import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
  Linking,
  Text,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import {WebView} from 'react-native-webview';

import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import {ROUTES} from '../../shared/utils/routes';
import {useNavigation} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { clearCardItems } from '../../shared/redux/reducers/bookingReducer';
import { encryptText } from '../../shared/services/service';
import { WEBSITE_URL } from '../../shared/utils/constants';
import FullScreenLoader from '../../components/FullScreenLoader';
import { globalTextStyles } from '../../styles/globalStyles';

const Payment = ({ onPressNext, onPressBack }: any) => {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<any>(null);
  const [reloadWebView, setReloadWebView] = useState(false);
  const [latestUrl, setLatestUrl] = useState('');
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
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

  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const generatePaymentUrl = async () => {
    const dataUser = {Id:user.Id,FullNameSlang:user.FullnameSlang}
    const paramsJson = JSON.stringify(dataUser);
    const encryptedVisitData = encryptText(paramsJson, '!naarakum@789');
    return `${WEBSITE_URL}service/payment?mudfp=${encryptedVisitData}`
  }

  useEffect(() => {
    const getPaymentUrl = async () => {
      setLoading(true);
      const paymentUrl:any = await generatePaymentUrl()
      setCurrentUrl(paymentUrl);
      setLoading(false);
    }
    getPaymentUrl();
  }, [])

  const handleMessage = async (event: any) => {
    const {
      url,
      userInfo,
      event: eventHandler,
      data,
      fileName,
    } = JSON.parse(event.nativeEvent.data);

  };

  const handleLoadError = (event: any) => {
    setLoading(false);
    setReloadWebView(true);
    setTimeout(() => {
      setReloadWebView(false);
    }, 100);
  };


  const onNavigationStateChange = (url: any) => {
    if(url.url.includes("PaymentSuccess")){
      const tempCard = CardArray;
      dispatch(clearCardItems());
      navigation.navigate("OrderSuccess", { SuccessResponse:tempCard });
    }
    else if(url.url.includes("PaymentError")){
      navigation.navigate("OrderSuccess", { SuccessResponse:"Error in payment" });
    }
  };

  if(currentUrl == null){
    return (
      <View style={styles.container}>
        <Text style={{ ...globalTextStyles.bodyMedium }}>Loading...</Text>
      </View>
    )
  }

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
        <FullScreenLoader visible={loading} />
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

export default Payment;
