import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import WebViewComponent from '../components/WebViewComponent';
import { WEBSITE_URL } from '../shared/utils/constants';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const HomeScreen = () => {
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
      return true;
    } else {
      return false;
    }
  };

  const requestAndroidPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ]);

      if (
        granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  const requestPermissions = async () => {
    return Platform.OS === 'ios' ? requestiOSPermissions() : requestAndroidPermissions();
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WebViewComponent uri={WEBSITE_URL} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
