import WebViewComponent from '../components/WebViewComponent';
import React, { useEffect } from 'react';
import { Alert, BackHandler, SafeAreaView, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';


const HomeScreen = () => {

  useEffect(() => {
    requestCameraAndAudioPermission()
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to close the app?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler?.remove();
  }, []);

  const requestiOSPermissions = async () => {
    const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
    const microphonePermission = await request(PERMISSIONS.IOS.MICROPHONE);
    const photoLibraryPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    const mediaLibraryPermission = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
  
    if (
      cameraPermission === RESULTS.GRANTED &&
      microphonePermission === RESULTS.GRANTED &&
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

  async function requestCameraAndAudioPermission() {
    if (Platform.OS === 'ios') {
      return requestiOSPermissions();
    } else {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);
  
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
        } else {
        }
      } catch (err) {
      }
    }
    
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <WebViewComponent uri="https://staging.innotech-sa.com/naraakum/Web/Web/Index" /> */}
      {/*<WebViewComponent uri="https://dvx.innotech-sa.com/HHC/web/Web/Index" />*/}
      <WebViewComponent uri="https://nkapps.innotech-sa.com/" /> 
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
