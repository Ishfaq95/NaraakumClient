import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, I18nManager, TextInput, Alert, Keyboard, Image, Platform } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import { countries } from '../../utils/countryData';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import { useDispatch, useSelector } from 'react-redux';
import { setTopic, setUser } from '../../shared/redux/reducers/userReducer';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import { authService } from '../../services/api/authService';
import { RootState } from '../../shared/redux/store';
import WebSocketService from '../../components/WebSocketService';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import AppleIcon from '../../assets/icons/AppleIcon';
import { signInWithGoogle } from '../../services/auth/googleAuthService';
import appleAuth from '@invertase/react-native-apple-authentication';
import { globalTextStyles } from '../../styles/globalStyles';
import FullScreenLoader from '../../components/FullScreenLoader';


interface Country {
  code: string;
  name: string;
  nameAr: string;
  phoneCode: string;
  flag: string;
}

const DeleteScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'email' | 'mobile'>('mobile');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const isRTL = I18nManager.isRTL;
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.root.user.user);
  const webSocketService = WebSocketService.getInstance();

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={[globalTextStyles.h4, styles.headerTitle]}>{t('delete_account')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError(false);
  };

  const handleDeleteAccount = async () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    try {
      setIsLoading(true);
      let hasError = false;

      if (!password.trim()) {
        setPasswordError(true);
        hasError = true;
      }

      if (hasError) {
        setIsLoading(false);
        return;
      }

      let data = {
        "Username": user?.Id,
        "Password": password,
        "Filter": "userId"
      }

      const response = await authService.deleteAccount(data);

      if (response?.StatusCode?.STATUSCODE == 3010) {
        setIsLoading(false);
        setDeleteAccountError(true);
        

      } else if (response?.StatusCode?.STATUSCODE == 3032) {
        setDeleteAccountError(true);
      }else{
        dispatch(setUser(null));
        dispatch(setTopic(null));
        webSocketService.disconnect();
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      // Handle login error here (show error message, etc.)
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const googleUser = await signInWithGoogle();

      await deleteSocialAccount(googleUser.id);

    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert(
        t('error'),
        error.message || t('google_login_failed'),
        [{ text: t('ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSocialAccount = async (UniqueSocialId: string | undefined) => {
    try {
      const payload = {
        "UniqueSocialId": UniqueSocialId,
        "Username": user?.Id,
        "Filter": "socialId"
      }
      
      const response = await authService.deleteAccount(payload);

      if (response?.StatusCode?.STATUSCODE == 3010) {
        Alert.alert(
          "Error",
          response?.StatusCode?.MESSAGE,
          [{ text: "OK" }]
        );
      }else if (response?.StatusCode?.STATUSCODE == 3032) {
        Alert.alert(
          "Error",
          response?.StatusCode?.MESSAGE,
          [{ text: "OK" }]
        );
      }else{
        dispatch(setUser(null));
        dispatch(setTopic(null));
        webSocketService.disconnect();
      }
    } catch (error: any) {
      console.error('Delete social account error:', error);
    }
  }

  const handleAppleLogin = async () => {
    try {
      // Dismiss any existing modals first
      setIsLoading(false);
      
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleAuthResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      const { identityToken, nonce, fullName, email, user } = appleAuthResponse;
      
      await deleteSocialAccount(user);
      
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
      } else {
        console.error('Apple Sign in error:', error);
        Alert.alert(
          t('error'),
          error.message || t('apple_login_failed'),
          [{ text: t('ok') }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderSocialButtons = () => {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.socialButtonsRow}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon width={24} height={24} style={styles.socialIcon} />
            <Text style={[globalTextStyles.bodySmall, styles.socialButtonText]}>{t('continue_with_google')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialButton, styles.appleButton]}
            onPress={handleAppleLogin}
          >
            <AppleIcon
              width={24}
              height={24}
              style={styles.socialIcon}
              color="#FFFFFF"
            />
            <Text style={[globalTextStyles.bodySmall, styles.socialButtonText, { color: '#FFFFFF' }]}>
              {t('continue_with_apple')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton, styles.centerButton]}
        onPress={handleGoogleLogin}
      >
        <GoogleIcon width={24} height={24} style={styles.socialIcon} />
        <Text style={[globalTextStyles.bodySmall, styles.socialButtonText]}>{t('continue_with_google')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.contentContainer}>
        <View style={{ alignItems: 'center',marginTop:20, justifyContent: 'center' }}>
          <Image source={require('../../assets/images/del-icon.png')} style={{ width: 100, height: 100 }} />
          <Text style={[globalTextStyles.h5, { color: '#000', marginTop: 10, textAlign: I18nManager.isRTL ? 'left' : 'right' }]}>{t('delete_account_title')}</Text>
          <Text style={[globalTextStyles.bodySmall, { color: '#000', marginTop: 10, textAlign: I18nManager.isRTL ? 'left' : 'right' }]}>{t('delete_account_description')}</Text>
        </View>
        {(user.UniqueSocialId != null && user.UniqueSocialId != "" && user.UniqueSocialId != undefined) ? (
          renderSocialButtons()
        ):
        <>
        <View style={{ marginTop: 30 }}>
          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                isRTL && styles.rtlInput,
                passwordError && styles.inputError
              ]}
              placeholder={t('password')}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
              textAlign={isRTL ? 'right' : 'left'}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeIcon width={22} height={22} color="#666666" />
              ) : (
                <EyeOffIcon width={22} height={22} color="#666666" />
              )}
            </TouchableOpacity>
          </View>
          {deleteAccountError && <Text style={[globalTextStyles.bodySmall, { color: 'red',  textAlign: 'center' }]}>كلمة المرور غير صالحة</Text>}
        </View>



        {/* Login Button */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={styles.loginButton}
          activeOpacity={0.7}
        >
          <Text style={[globalTextStyles.buttonMedium, styles.loginButtonText]}>{t('delete_account_button')}</Text>
        </TouchableOpacity>
        </>}
        

        <FullScreenLoader
          visible={isLoading}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerTitle: {
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
  tab: { flexDirection: 'row', width: '48%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  tabText: {
    color: '#666',
  },
  activeTab: {
    backgroundColor: '#eaf6f6'
  },
  activeTabText: {
    color: '#008080',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    height: 50,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: 'Cairo-Regular',
  },
  mobileInputContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    position: 'absolute',
    bottom: -20,
    left: 0,
  },
  dropdown: {
    height: '100%',
    minWidth: 110,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ltrInput: {
    textAlign: 'left',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
    marginTop: 10,
    height: 50,
  },
  passwordInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: '100%',
    color: '#000',
    fontFamily: 'Cairo-Regular'
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  rtlInput: {
    textAlign: 'right',
    paddingRight: 12,
    paddingLeft: 12,
  },
  loginButton: {
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    zIndex: 1,
  },
  loginButtonText: {
    color: '#FFFFFF',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
    gap: 12,
    paddingHorizontal: Platform.OS === 'ios' ? 4 : 0,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Platform.OS === 'ios' ? 8 : 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 48,
    minWidth: Platform.OS === 'ios' ? 140 : undefined,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    flex: Platform.OS === 'ios' ? 1 : undefined,
    width: Platform.OS === 'android' ? '100%' : undefined,
  },
  appleButton: {
    backgroundColor: '#000000',
    flex: 1,
  },
  centerButton: {
    alignSelf: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialButtonText: {
    color: '#333333',
    flexShrink: 1,
    textAlign: 'center',
  },
})

export default DeleteScreen