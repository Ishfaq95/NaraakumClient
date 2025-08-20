import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, TextInput, Platform, SafeAreaView } from 'react-native'
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
import FullScreenLoader from '../../components/FullScreenLoader';

const { width } = Dimensions.get('window');

const ForgotOTP = ({ route }: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const OTPSend = route.params.OTPSend;
  const UserId = route.params.UserId;
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const payload = {
        "UserId": UserId,
        "VerificationCode": otp,
        "VerificationPlatformId": Platform.OS === 'ios' ? 3 : 2
      }
      console.log("payload", payload);
      const response = await authService.verifyOTP(payload);
      console.log(response);
      if (response.ResponseStatus.STATUSCODE == 200) {
        if (response.StatusCode.STATUSCODE == 3007) {
          navigation.navigate(ROUTES.ConfirmPassword, { UserId: UserId });
        }
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log("error", error);
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
            <OTPIcon />
          </View>

          {/* Main Heading */}
          <Text style={styles.mainHeading}>
            الرجاء إدخال رمز التحقق المرسل إلى
          </Text>

          {/* Sub Text */}
          <Text style={styles.subText}>
            {OTPSend}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 20 }}>

          <View style={styles.inputGroup}>
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{'رمز التحقق'}</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            <TextInput
              style={[styles.textInput, otpError && styles.inputError]}
              placeholder="رمز التحقق"
              placeholderTextColor="#999"
              textAlign="right"
              value={otp}
              keyboardType="numeric"
              onChangeText={(text) => {
                setOtp(text);
                if (otpError) setOtpError('');
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleVerifyOTP} style={styles.button}>
              <Text style={styles.buttonText}>{'تاكيد'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWithBorder}>
              <Text style={styles.buttonTextWithBorder}>{'تغيير الرقم او بريد الكتروني'}</Text>
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
    marginBottom: 8,
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
})

export default ForgotOTP