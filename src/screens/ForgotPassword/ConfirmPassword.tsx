import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, TextInput, Platform, I18nManager, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import OTPIcon from '../../assets/icons/OTPIcon';
import { authService } from '../../services/api/authService';
import { ROUTES } from '../../shared/utils/routes';
import ResetPasswordIcon from '../../assets/icons/ResetPasswordIcon';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import FullScreenLoader from '../../components/FullScreenLoader';

const { width } = Dimensions.get('window');

const ConfirmPassword = ({ route }: any) => {
  const UserId = route.params.UserId;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [PasswordNotMatch, setPasswordNotMatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = I18nManager.isRTL;
  const handleBack = () => {
    navigation.goBack();
  }

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text numberOfLines={1} style={[globalTextStyles.h5, styles.headerTitle]}>{'تغيير كلمة المرور'}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const handleConfirmPassword = async () => {
    
    if (newPassword.trim() === '') {
      setNewPasswordError('كلمة المرور الجديدة مطلوبة');
      return;
    } else {
      setNewPasswordError('');
    }
    if (confirmPassword.trim() === '') {
      setConfirmPasswordError('تأكيد كلمة المرور مطلوبة');
      return;
    } else {
      setConfirmPasswordError('');
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotMatch(true);
      return;
    } else {
      setPasswordNotMatch(false);
    }

    try {
      setIsLoading(true);
      const payload = {
        "UserloginInfoId": UserId,
        "Password": newPassword,
      }
      const response = await authService.resetPassword(payload);
      if (response.ResponseStatus.STATUSCODE == 200) {
        navigation.navigate(ROUTES.Login);
      } else {
      }
    } catch (error) {
    }
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <ResetPasswordIcon />
          </View>

          {/* Main Heading */}
          <Text style={styles.mainHeading}>
            الرجاء إدخال رمز التحقق المرسل إلى
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 20 }}>

          <View style={{}}>
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{'كلمة المرور الجديدة '}</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  isRTL && styles.rtlInput,
                  newPasswordError && styles.inputError
                ]}
                placeholder={t('password')}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (newPasswordError) setNewPasswordError('');
                }}
                secureTextEntry={!showNewPassword}
                placeholderTextColor="#999"
                textAlign={isRTL ? 'right' : 'left'}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showNewPassword ? (
                  <EyeIcon width={22} height={22} color="#666666" />
                ) : (
                  <EyeOffIcon width={22} height={22} color="#666666" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{}}>
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{'تأكيد كلمة المرور '}</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  isRTL && styles.rtlInput,
                  confirmPasswordError && styles.inputError
                ]}
                placeholder={t('password')}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
                textAlign={isRTL ? 'right' : 'left'}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showConfirmPassword ? (
                  <EyeIcon width={22} height={22} color="#666666" />
                ) : (
                  <EyeOffIcon width={22} height={22} color="#666666" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {PasswordNotMatch && <Text style={{ color: 'red', fontFamily: CAIRO_FONT_FAMILY.bold, fontSize: 12, marginTop: 10, textAlign: 'center' }}>{'تأكيد كلمة المرور وكلمة المرور غير متطابقة'}</Text>}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleConfirmPassword} style={styles.button}>
              <Text style={styles.buttonText}>{'تاكيد'}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>

      <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  content: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainHeading: {
    ...globalTextStyles.h2,
    color: '#008080', // Teal color as shown in the image
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subText: {
    ...globalTextStyles.bodyLarge,
    fontWeight: 'bold',
    color: '#666', // Gray color as shown in the image
    textAlign: 'left',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000', // Teal color to match the main heading
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    height: 50,
  },
  inputGroup: {
    marginBottom: 15,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  requiredAsterisk: {
    color: '#FF0000',
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  questionText: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    marginBottom: 8,
  },
  textInput: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonWithBorder: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    ...globalTextStyles.bodySmall,
    color: '#fff',
  },
  buttonTextWithBorder: {
    ...globalTextStyles.bodySmall,
    color: '#008080',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
    height: 50,
  },
  passwordInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    ...globalTextStyles.bodySmall,
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
  rtlInput: {
    textAlign: 'right',
    paddingRight: 12,
    paddingLeft: 12,
  },
})

export default ConfirmPassword