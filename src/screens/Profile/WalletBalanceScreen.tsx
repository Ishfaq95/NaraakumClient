import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
  Linking,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import { WebView } from 'react-native-webview';

import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import { ROUTES } from '../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { clearCardItems } from '../../shared/redux/reducers/bookingReducer';
import { encryptText } from '../../shared/services/service';
import { WEBSITE_URL } from '../../shared/utils/constants';
import FullScreenLoader from '../../components/FullScreenLoader';
import { useTranslation } from 'react-i18next';
import Header from '../../components/common/Header';
import ArrowRightIcon from '../../assets/icons/RightArrow';

const WalletBalanceScreen = () => {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<any>(null);
  const [reloadWebView, setReloadWebView] = useState(false);
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const user = useSelector((state: any) => state.root.user.user);

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('wallet_balance')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const generatePaymentUrl = async () => {
    const dataUser = { Id: user.Id, FullNameSlang: user.FullnameSlang }
    const paramsJson = JSON.stringify(dataUser);
    const encryptedVisitData = encryptText(paramsJson, '!naarakum@789');
    return `${WEBSITE_URL}Service/WalletPurchase?mudfp=${encryptedVisitData}`
  }

  useEffect(() => {
    const getPaymentUrl = async () => {
      setLoading(true);
      const paymentUrl: any = await generatePaymentUrl()
      setCurrentUrl(paymentUrl);
      setLoading(false);
    }
    getPaymentUrl();
  }, [])

  const handleLoadError = (event: any) => {
    setLoading(false);
    setReloadWebView(true);
    setTimeout(() => {
      setReloadWebView(false);
    }, 100);
  };


  const onNavigationStateChange = async (url: any) => {
    if (url.url.includes("PaymentSuccess")) {
      const webviewUrl = await generatePaymentUrl();
      setCurrentUrl(webviewUrl);
    }
    else if (url.url.includes("PaymentError")) {
      const webviewUrl = await generatePaymentUrl();
      setCurrentUrl(webviewUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {currentUrl ? <View style={styles.webviewContainer}>
        {reloadWebView ? (
          <View style={styles.loader}>
            <LoaderKit
              style={{ width: 100, height: 100 }}
              name={'BallSpinFadeLoader'}
              color={'green'}
            />
          </View>
        ) : Platform.OS === 'ios' ? (
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
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
            onError={handleLoadError}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
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
            onError={handleLoadError}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
          />
        )}
      </View> :
        <View style={styles.contentContainer}>
          <Text>Loading...</Text>
        </View>}

      <FullScreenLoader visible={loading} />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
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

export default WalletBalanceScreen;
