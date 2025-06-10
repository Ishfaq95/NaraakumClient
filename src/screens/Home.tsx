import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import WebViewComponent from '../components/WebViewComponent';
import { WEBSITE_URL } from '../shared/utils/constants';


const HomeScreen = () => {
  

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
