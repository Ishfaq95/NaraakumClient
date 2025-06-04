import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  I18nManager,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { parsePhoneNumber, AsYouType, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import GoogleIcon from '../assets/icons/GoogleIcon';
import AppleIcon from '../assets/icons/AppleIcon';
import EyeIcon from '../assets/icons/EyeIcon';
import EyeOffIcon from '../assets/icons/EyeOffIcon';
import CheckIcon from '../assets/icons/CheckIcon';
import { countries } from '../utils/countryData';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { authService } from '../services/api/authService';
import { setUser, setToken } from '../shared/redux/reducers/userReducer';
import { useDispatch } from 'react-redux';
import FullScreenLoader from '../components/FullScreenLoader';
import { signInWithGoogle } from '../services/auth/googleAuthService';
import AuthHeader from '../components/AuthHeader';

const MIN_HEIGHT = 550; // Absolute minimum height
const OPTIMAL_HEIGHT = 750; // Height for medium screens

interface Country {
  code: string;
  name: string;
  nameAr: string;
  phoneCode: string;
  flag: string;
}

const LoginScreen = () => {
  const { height: windowHeight } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'email' | 'mobile'>('mobile');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(countries.find(c => c.code === 'sa'));
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [formattedNumber, setFormattedNumber] = useState('');
  const [fullNumber, setFullNumber] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isRTL = I18nManager.isRTL;
  const isLargeScreen = windowHeight > OPTIMAL_HEIGHT;
  const isSmallScreen = windowHeight < MIN_HEIGHT;
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneNumberChange = (data: { phoneNumber: string; isValid: boolean; countryCode: string; fullNumber: string }) => {
    console.log('data', data);
    setMobileNumber(data.phoneNumber);
    setIsValidNumber(data.isValid);
    setFullNumber(data.fullNumber);
  };

  // Format the initial number when country changes
  useEffect(() => {
    if (mobileNumber) {
      handlePhoneNumberChange({ phoneNumber: mobileNumber, isValid: isValidNumber, countryCode: '', fullNumber: '' });
    }
  }, [selectedCountry]);

  const handleLogin = async () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    try {
      setIsLoading(true);
      let hasError = false;

      if (activeTab === 'email' && !emailOrUsername.trim()) {
        setEmailError(true);
        hasError = true;
      }

      if (!password.trim()) {
        setPasswordError(true);
        hasError = true;
      }

      if (hasError) {
        setIsLoading(false);
        return;
      }

      let data = {
        "Username": activeTab === 'mobile' ? fullNumber : emailOrUsername,
        "Password": password,
        "Filter": activeTab === 'mobile' ? "mob" : "email"
      }

      console.log('data', data);

      const response = await authService.login(data);

      if (response?.ResponseStatus?.STATUSCODE == 200) {
        console.log('response====>', response);
        dispatch(setUser(response.Userinfo));
      } else {
        console.log('response', response.ResponseStatus?.STATUSCODE);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      // Handle login error here (show error message, etc.)
    }
  };

  const handleEmailChange = (text: string) => {
    setEmailOrUsername(text);
    if (emailError) setEmailError(false);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const googleUser = await signInWithGoogle();

      const data = {
        "FullName": googleUser.name,
        "Username": googleUser.name,
        "Email": googleUser.email,
        "UniqueSocialId": googleUser.id,
        "RegistrationPlatformId":2,
        "RegistrationTypeId":1,
        "CatSocialServerId":1, 
        "CatUserTypeId":1,
        "CatNationalityId":1,
      }

      // // Call your API to save the Google user data
      const response = await authService.loginWithGoogle(data);

      if (response?.ResponseStatus?.STATUSCODE === 200) {
        console.log("response", response.Userinfo);
        dispatch(setUser(response.Userinfo[0]));
      } else {
        Alert.alert(
          t('error'),
          t('google_login_failed'),
          [{ text: t('ok') }]
        );
      }
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

  const renderSocialButtons = () => {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.socialButtonsRow}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon width={24} height={24} style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>{t('continue_with_google')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            <AppleIcon
              width={24}
              height={24}
              style={styles.socialIcon}
              color="#FFFFFF"
            />
            <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
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
        <Text style={styles.socialButtonText}>{t('continue_with_google')}</Text>
      </TouchableOpacity>
    );
  };

  const renderCountryItem = (item: any) => {
    return (
      <View style={styles.dropdownItem}>
        <Text style={styles.flagText}>{item.flag}</Text>
        <Text style={styles.countryCodeText}>{item.phoneCode}</Text>
        <Text style={styles.countryNameText} numberOfLines={1}>
          {I18nManager.isRTL ? item.nameAr : item.name}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader />
      <FullScreenLoader visible={isLoading} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollView
            ]}
            bounces={false}
            showsVerticalScrollIndicator={isSmallScreen}>
            <View style={[
              styles.contentContainer
            ]}>
              <View style={{ height: 100, width: '100%', borderRadius: 12, padding: 16, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222' }}>
                  {t('login')}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 20 }}>
                <Text style={{ fontSize: 14, color: '#666' }}>Login With</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <TouchableOpacity onPress={() => setActiveTab('mobile')} style={[styles.tab, activeTab === 'mobile' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'mobile' && styles.activeTabText]}>{t('mobile_number')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActiveTab('email')} style={[styles.tab, activeTab === 'email' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}> {t('email_username')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ marginTop: 30 }}>
                  {/* Input Fields */}
                  {activeTab === 'email' ? (
                    <TextInput
                      style={[
                        styles.input,
                        styles.ltrInput,
                        emailError && styles.inputError
                      ]}
                      placeholder={"example@info.com"}
                      value={emailOrUsername}
                      onChangeText={handleEmailChange}
                      placeholderTextColor="#999"
                      textAlign="left"
                    />
                  ) : (
                    <PhoneNumberInput
                      value={mobileNumber}
                      onChangePhoneNumber={handlePhoneNumberChange}
                      placeholder={t('mobile_number')}
                      errorText={t('mobile_number_not_valid')}
                    />
                  )}

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
                </View>

                {/* Remember Me and Forgot Password */}
                <View style={styles.rememberContainer}>
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}>
                    <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
                      {rememberMe && <CheckIcon width={12} height={12} />}
                    </View>
                    <Text style={styles.rememberText}>{t('remember_me')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>{t('forgot_password')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  style={styles.loginButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginButtonText}>{t('login')}</Text>
                </TouchableOpacity>

                {/* Bottom Section */}
                <View style={[
                  styles.bottomContainer,
                ]}>
                  <View style={[styles.orContainer]}>
                    <View style={styles.orLine} />
                    <Text style={[
                      styles.orText,
                      isLargeScreen && { fontSize: 14 }
                    ]}>{t('or_continue_with')}</Text>
                    <View style={styles.orLine} />
                  </View>

                  {renderSocialButtons()}

                  <View style={[styles.signUpContainer]}>
                    <Text style={[
                      styles.signUpText,
                      isLargeScreen && { fontSize: 14 }
                    ]}>{t('dont_have_an_account')}</Text>
                    <TouchableOpacity>
                      <Text style={[
                        styles.signUpLink,
                        isLargeScreen && { fontSize: 14 }
                      ]}>{t('sign_up')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>


            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf6f6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logo: {
    marginBottom: 8,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    color: '#333',
  },
  createAccountText: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: { flexDirection: 'row', width: '48%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTab: {
    backgroundColor: '#eaf6f6'
  },
  activeTabText: {
    color: '#008080',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    height: 50,
    color: '#000',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  flagText: {
    fontSize: 16,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: '500',
  },
  countryNameText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  mobileInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#000',
    height: '100%',
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
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: '100%',
    color: '#000'
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#008080',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#008080',
  },
  rememberText: {
    fontSize: 12,
    color: '#666',
  },
  forgotPassword: {
    fontSize: 12,
    color: '#008080',
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '600',
  },
  bottomContainer: {
    marginTop: 30,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 8,
    color: '#666',
    fontSize: 12,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  signUpText: {
    fontSize: 12,
    color: '#666',
  },
  signUpLink: {
    fontSize: 12,
    color: '#008080',
    fontWeight: '600',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
  },
  ltrInput: {
    textAlign: 'left',
  },
  rtlInput: {
    textAlign: 'right',
    paddingRight: 12,
    paddingLeft: 12,
  },
  labelContainer: {
    width: '100%',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: Platform.OS === 'ios' ? 13 : 14,
    color: '#333333',
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'center',
  },
  requiredStar: {
    color: '#FF3B30',
    fontSize: 14,
  },
});

export default LoginScreen; 