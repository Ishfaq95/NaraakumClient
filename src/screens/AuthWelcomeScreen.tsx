import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { globalTextStyles } from '../styles/globalStyles';
import { ROUTES } from '../shared/utils/routes';

const { width, height } = Dimensions.get('window');

const AuthWelcomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  return (
    <ImageBackground
      source={require('../assets/images/backgroundImage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>{t('login')}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.createButton} onPress={() => navigation.navigate(ROUTES.SignUp)}>
            <Text style={styles.createButtonText}>{t('createNewAccount')}</Text>
          </TouchableOpacity>
          
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 16,
  },
  illustration: {
    width: width * 0.9,
    height: height * 0.35,
    marginTop: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent:'center',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#22A6A7',
    borderRadius: 8,
    width: width * 0.85,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    ...globalTextStyles.buttonLarge,
  },
  createButton: {
    borderWidth: 1.5,
    borderColor: '#22A6A7',
    borderRadius: 8,
    width: width * 0.85,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    ...globalTextStyles.buttonMedium,
    color: '#22A6A7',
  },
  versionText: {
    color: '#bdbdbd',
    fontSize: 14,
    marginTop: 8,
  },


});

export default AuthWelcomeScreen; 