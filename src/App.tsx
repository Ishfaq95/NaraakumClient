import {NavigationContainer} from '@react-navigation/native';
import {persistor, store} from './shared/redux/store';
import {navigationRef} from './shared/services/nav.service';
import React, {useEffect} from 'react';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import messaging from '@react-native-firebase/messaging';
import Routes from './routes/index';
import NotificationsCenter from './components/NotificationConfig';
import SplashScreen from 'react-native-splash-screen';
import {Platform, Text, TouchableOpacity, View} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AlarmListener from './components/AlarmListener';
import {Connectivity} from './components/NetwordConnectivity';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import queryClient from './Network/queryClient';
import {CrashlyticsErrorBoundary} from './components/CrashlyticsErrorBoundary';
import { CrashlyticsProvider } from './components/CrashlyticsProvider';
import crashlytics from '@react-native-firebase/crashlytics';

const App = () => {
  useEffect(() => {
    const type = 'notification';
    PushNotificationIOS.addEventListener(type, onRemoteNotification);
    return () => {
      PushNotificationIOS.removeEventListener(type);
    };
  });

  const onRemoteNotification = (notification: any) => {
    const actionIdentifier = notification.getActionIdentifier();
    console.log('notificationnotification', notification);

    if (actionIdentifier === 'open') {
      // Perform action based on open action
    }

    if (actionIdentifier === 'text') {
      // Text that of user input.
      const userText = notification.getUserText();
      // Perform action based on textinput action
    }
    // Use the appropriate result based on what you needed to do for this notification
    const result = PushNotificationIOS.FetchResult.NoData;
    notification.finish(result);
  };

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);

    requestUserPermission();
  }, []);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
    }
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <CrashlyticsErrorBoundary>
              <CrashlyticsProvider
                userId="user"
                customKeys={{
                  appVersion: '1.0.2',
                  environment: 'development',
                }}>
                <NavigationContainer ref={navigationRef}>
                  <Routes />
                  <NotificationsCenter />
                  {Platform.OS == 'android' && <AlarmListener />}
                  <Connectivity />
                </NavigationContainer>
              </CrashlyticsProvider>
            </CrashlyticsErrorBoundary>
          </QueryClientProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
