import React, { useEffect } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../shared/utils/routes';

const AlarmListener = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Listen for the "AlarmEvent" emitted from the native side
    const eventEmitter = new NativeEventEmitter(NativeModules.AlarmModule);
   
    const subscription = eventEmitter.addListener('AlarmEvent', (message) => {
      navigation.navigate(ROUTES.AlarmScreen, { message });
    });

    // Clean up the listener on unmount
    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return null; // This component doesn't render any UI
};

export default AlarmListener;
