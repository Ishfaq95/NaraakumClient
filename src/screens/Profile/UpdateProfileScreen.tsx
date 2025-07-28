import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Image, I18nManager, Platform, ScrollView, Alert, Modal, InteractionManager, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Dropdown from '../../components/common/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import { MediaBaseURL } from '../../shared/utils/constants';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { profileService } from '../../services/api/ProfileService';
import FullScreenLoader from '../../components/FullScreenLoader';
import { pick } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { setHomeDialysisFilePaths } from 'shared/redux/reducers/bookingReducer';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import EmailUpdateComponent, { PhoneUpdateComponent, VerificationCodeCompoent } from '../../components/emailUpdateComponent';
import { setUser } from '../../shared/redux/reducers/userReducer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const genders = [
  { label: 'ذكر', value: 'male' },
  { label: 'أنثى', value: 'female' },
];

const nationalities = [
  { label: 'مواطن (معفى من الضريبة)', value: 'citizen' },
  { label: 'مقيم', value: 'resident' },
];

const UpdateProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('citizen');
  const [idNumber, setIdNumber] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const user = useSelector((state: RootState) => state.root.user.user);
  const [mobileNumber, setMobileNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [fullNumber, setFullNumber] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [selectedUserImage, setSelectedUserImage] = useState('')
  const [defaultUserImage, setDefaultUserImage] = useState('')
  const [isUploading, setIsUploading] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('')
  const [openEmailBottomSheet, setOpenEmailBottomSheet] = useState(false)
  const [openPhoneBottomSheet, setOpenPhoneBottomSheet] = useState(false)
  const [openVerifyBottomSheet, setOpenVerifyBottomSheet] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [updatedEmail, setUpdatedEmail] = useState('')
  const [statusCodeEmail, setStatusCodeEmail] = useState(0)
  const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState('')
  const [updatedFullPhoneNumber, setUpdatedFullPhoneNumber] = useState('');
  const [bottomSheetType, setBottomSheetType] = useState<'phone' | 'email' | null>(null);
  const [emailBottomSheetHeight, setEmailBottomSheetHeight] = useState("35%")
  const [phoneBottomSheetHeight, setPhoneBottomSheetHeight] = useState("35%")
  const [emailInputError, setEmailInputError] = useState(false)
  const [phoneInputError, setPhoneInputError] = useState(false)
  const mediaToken = useSelector((state: any) => state.root.user.mediaToken);
  const [loadingImage, setLoadingImage] = useState(false)
  const isRTL = I18nManager.isRTL;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch()
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordModalMessage, setPasswordModalMessage] = useState('');

  // Password validation function
  const validatePassword = (pwd: string) => {
    // At least 8 characters, at least one uppercase, one lowercase, one number, one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(pwd);
  };

  const handleKeyboardOpen = () => {
    if (openEmailBottomSheet) {
      setEmailBottomSheetHeight("65%");
    }
    if (openPhoneBottomSheet) {
      setPhoneBottomSheetHeight("65%");
    }
  }

  const handleKeyboardClose = () => {
    if (openEmailBottomSheet) {
      setEmailBottomSheetHeight("35%");
    }
    if (openPhoneBottomSheet) {
      setPhoneBottomSheetHeight("35%");
    }
  }

  // Keyboard listeners for bottom sheet height adjustment
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        handleKeyboardOpen()
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        handleKeyboardClose()
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [openEmailBottomSheet, openPhoneBottomSheet]);



  // Function to extract country code and phone number from full number
  const extractPhoneInfo = (fullNumber: string) => {
    if (!fullNumber) return { countryCode: 'SA', phoneNumber: '' };

    // Remove any spaces or special characters
    const cleanNumber = fullNumber.replace(/\s/g, '');

    // Check for Saudi Arabia number (+966)
    if (cleanNumber.startsWith('+966')) {
      const phoneNumber = cleanNumber.substring(4); // Remove +966
      return { countryCode: 'SA', phoneNumber };
    }

    // Check for other country codes (you can add more as needed)
    const countryCodeMap: { [key: string]: string } = {
      '+971': 'AE', // UAE
      '+973': 'BH', // Bahrain
      '+964': 'IQ', // Iraq
      '+98': 'IR',  // Iran
      '+962': 'JO', // Jordan
      '+965': 'KW', // Kuwait
      '+961': 'LB', // Lebanon
      '+968': 'OM', // Oman
      '+970': 'PS', // Palestine
      '+974': 'QA', // Qatar
      '+963': 'SY', // Syria
      '+90': 'TR',  // Turkey
      '+967': 'YE'  // Yemen
    };

    for (const [code, country] of Object.entries(countryCodeMap)) {
      if (cleanNumber.startsWith(code)) {
        const phoneNumber = cleanNumber.substring(code.length);
        return { countryCode: country, phoneNumber };
      }
    }

    // Default to Saudi Arabia if no match found
    return { countryCode: 'SA', phoneNumber: cleanNumber.replace(/^\+/, '') };
  };

  // Extract phone info from user
  const phoneInfo = extractPhoneInfo(user?.CellNumber || '');
  const defaultCountryCode = phoneInfo.countryCode;
  const defaultPhoneNumber = phoneInfo.phoneNumber;

  useEffect(() => {
    console.log("user", user)
    setName(user?.FullnameSlang);
    setEmail(user?.Email);
    setAge(user?.Age);
    setGender(user?.Gender);
    setPhoneNumber(defaultPhoneNumber)
    if (user?.ImagePath) {
      setDefaultUserImage(user?.ImagePath)
    } else {
      setDefaultUserImage('')
    }
    if (user?.Gender == 1) {
      setGender('male');
    } else {
      setGender('female');
    }
    if (user?.CatNationalityId == 213) {
      setNationality('citizen');
    } else {
      setNationality('resident');
    }
    setIdNumber(user?.CatNationalityId == 213 && user?.IDNumber ? user?.IDNumber : '');
  }, [user]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePhoneNumberChange = (data: { phoneNumber: string; isValid: boolean; countryCode: string; fullNumber: string }) => {
    setMobileNumber(data.phoneNumber);
    setIsValidNumber(data.isValid);
    setFullNumber(data.fullNumber);
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('update_profile')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const updateUserProfileHandler = async () => {
    if (password) {
      if (!validatePassword(password)) {
        setPasswordModalMessage('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتتضمن حروفًا أبجدية وأرقامًا ورموزًا خاصة وحرفًا كبيرًا وصغيرًا');
        setPasswordModalVisible(true);
        setPasswordError(true); // always red for password field
        if (confirmPassword) {
          setConfirmPasswordError(true);
        } else {
          setConfirmPasswordError(false);
        }
        return;
      }
      if (password !== confirmPassword) {
        setPasswordModalMessage('تأكيد كلمة المرور وكلمة المرور غير متطابقة');
        setPasswordModalVisible(true);
        setPasswordError(true); // highlight both fields
        setConfirmPasswordError(true);
        return;
      }
    }
    setPasswordError(false); // reset on valid
    setConfirmPasswordError(false);
    try {
      setIsUploading(true);
      const payload = {
        "FullNamePlang": name,
        "FullNameSlang": name,
        "CellNumber": user?.CellNumber,
        "Email": email,
        "CatNationalityId": nationality == 'citizen' ? 213 : 187,
        "IDNumber": nationality == 'citizen' ? idNumber : '',
        "Gender": gender === 'male' ? "1" : "0",
        "Age": age,
        "ImagePath": defaultUserImage || '',
        "Password": password,
        "UserLoginInfoId": user?.Id,
      }

      console.log("payload", payload)
      const response = await profileService.updateUserProfile(payload)

      if (response?.ResponseStatus?.STATUSCODE == 200) {

        const payloadSuccessUpdateProfile = {
          "UserlogiInfoId": user?.Id
        }
        const responseUpdateprofile = await profileService.getUserUpdatedData(payloadSuccessUpdateProfile)
        dispatch(setUser(responseUpdateprofile.UserDetail[0]));

      }
    } catch (error: any) {
      console.log('error', error);
    } finally {
      setIsUploading(false);
    }
  }



  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError(false); // remove red border on edit
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError(false); // remove red border on edit
  };

  const handleFileSelection = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      async (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Image picker error');
          return;
        }

        const asset = response.assets?.[0];
        if (!asset) return;

        const file = {
          uri: asset.uri!,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize || 0,
        };

        await uploadFile(file, asset);
      },
    );
  };

  const uploadFile = async (file: any, pickerResult: any) => {
    try {
      setIsUploading(true);
      let url = `${MediaBaseURL}/common/upload`;
      let ResourceCategoryId = '2';

      let fileType = file?.name?.split('.')?.pop();
      if (fileType == 'pdf' || fileType == 'PDF') ResourceCategoryId = '4';
      else if (
        fileType == 'jpg' ||
        fileType == 'jpeg' ||
        fileType == 'gif' ||
        fileType == 'png' ||
        fileType == 'JPG' ||
        fileType == 'JPEG' ||
        fileType == 'GIF' ||
        fileType == 'PNG'
      )
        ResourceCategoryId = '1';

      const formData = new FormData();
      // Create file object that matches backend expectations
      const fileData = {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name,
      };

      // Append file with the exact field name expected by backend
      formData.append('file', fileData);
      formData.append('UserType', user.CatUserTypeId);
      formData.append('Id', user.Id);
      formData.append('ResourceCategory', ResourceCategoryId);
      formData.append('ResourceType', '6');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer${mediaToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 504) {
          throw new Error('Server took too long to respond. Please try again.');
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();

      if (responseData.ResponseStatus?.STATUSCODE === '200') {
        const imageUrl = responseData?.Data?.Path;
        setDefaultUserImage(imageUrl)
        setSelectedUserImage(imageUrl)
      } else {
        throw new Error(
          responseData.ResponseStatus?.MESSAGE || 'Upload failed',
        );
      }
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error instanceof Error
          ? error.message
          : 'Failed to upload file. Please try again.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const HandleDeleteImage = async () => {
    setDefaultUserImage('')
  }

  const HandleOpenEmailBottomSheet = () => {
    setOpenEmailBottomSheet(true)
    setUpdatedEmail('')
  }

  const HandleOpenPhoneBottomSheet = () => {
    setOpenPhoneBottomSheet(true)
    setUpdatedPhoneNumber('')
  }

  const HandleEmailUpdate = async () => {
    if (!updatedEmail) {
      setEmailInputError(true)
      return;
    }
    try {
      setIsUploading(true)
      const payload = {
        "Email": updatedEmail,
        "UserId": user.Id
      }

      const response = await profileService.userUpdatedEmail(payload)
      if (response?.ResponseStatus?.STATUSCODE === 200) {
        setOpenEmailBottomSheet(false)
        setTimeout(() => {
          setOpenVerifyBottomSheet(true)
        }, 500)
      }

    } catch (error) {
      console.log("error in user updated email", error);
    } finally {
      setIsUploading(false);
    }
  }

  const HandlePhoneUpdate = async () => {
    if (!updatedFullPhoneNumber || updatedFullPhoneNumber.trim() === '') {
      setPhoneInputError(true)
      return;
    }
    try {
      setIsUploading(true)
      const payload = {
        "Phonenumber": updatedPhoneNumber,
        "UserId": user.Id
      }

      const response = await profileService.userUpdatedPhone(payload)
      setUpdatedPhoneNumber('')
      if (response?.ResponseStatus?.STATUSCODE === 200) {
        setOpenPhoneBottomSheet(false)
        setTimeout(() => {
          setOpenVerifyBottomSheet(true)
        }, 500)
      }

    } catch (error) {
      console.log("error in user updated phone", error);
    } finally {
      setIsUploading(false)
    }
  }

  const HandleOtpResendButton = async () => {
    try {
      setIsUploading(true)
      const payload = {
        "UserId": user?.Id,
      }

      const response = await profileService.resendOtp(payload)
      console.log("response resend otp", response);

    } catch (error) {
      console.log("error in resend otp", error);
    } finally {
      setIsUploading(false)
    }
  }

  const HandleOtpSubmit = async () => {
    try {
      setIsUploading(true)
      const payload = {
        "UserId": user?.Id,
        "VerificationCode": otpValue,
        "VerificationPlatformId": "1"
      }

      const response = await profileService.verifyUserUpdatedData(payload)
      setOpenVerifyBottomSheet(false)
      setOtpValue('')

      console.log("response Verify User Data", response);
    } catch (error) {
      console.log("error in user verify data", error);
    } finally {
      setIsUploading(false)
    }

  }

  const HandleCloseEmailModal = () => {
    setOpenEmailBottomSheet(false)
    setUpdatedEmail('')
    handleKeyboardClose()
  }

  const HandleClosePhoneModal = () => {
    handleKeyboardClose()
    setOpenPhoneBottomSheet(false)
    setUpdatedPhoneNumber('')
  }

  const HandleCloseVerifyModal = () => {
    setOtpValue('')
    setOpenVerifyBottomSheet(false)
  }

  const HandleChangePhoneNumber = (data: { phoneNumber: string; isValid: boolean; countryCode: string; fullNumber: string }) => {
    setUpdatedPhoneNumber(data.phoneNumber);
    setUpdatedFullPhoneNumber(data.fullNumber);
    setPhoneInputError(false)
  }

  const getFileName = (url: string) => {
    const fileName = url.split('/').pop();
    return fileName;
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView style={styles.scrollContent}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {
                loadingImage && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#23a2a4" />
                </View>
              }
              {defaultUserImage ? <Image
                key={defaultUserImage}
                onLoadStart={() => setLoadingImage(true)}
                onLoadEnd={() => setLoadingImage(false)}
                source={{ uri: `${MediaBaseURL}${defaultUserImage}` }}
                style={{ height: '100%', width: '100%', borderRadius: 45, resizeMode: 'cover' }}
              /> :
                <View style={styles.avatarCircle}>
                  <AntDesign name="user" size={64} color="#23a2a4" />
                </View>}
              {defaultUserImage ?
                <TouchableOpacity onPress={HandleDeleteImage} style={styles.dleteIconContainer}>
                  <MaterialDesignIcons name="delete" size={22} color="#d84d48ff" />
                </TouchableOpacity>
                : null}
            </View>
            {/* Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>الاسم</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="الاسم" />
            </View>
            {/* Mobile */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>رقم الجوال</Text>
              <View style={styles.row}>
                <PhoneNumberInput
                  value={phoneNumber}
                  onChangePhoneNumber={handlePhoneNumberChange}
                  placeholder={t('mobile_number')}
                  errorText={t('mobile_number_not_valid')}
                  defaultCountry={defaultCountryCode}
                  editable={false}
                />
                <TouchableOpacity onPress={HandleOpenPhoneBottomSheet} style={styles.updateBtn}>
                  <Text style={styles.updateBtnText}>تحديث</Text>
                  <Icon name="edit" size={18} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, textAlign: 'left' }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="abcd@xyz.com"
                  keyboardType="email-address"
                  editable={false}
                />
                <TouchableOpacity onPress={HandleOpenEmailBottomSheet} style={styles.updateBtn}>
                  <Text style={styles.updateBtnText}>تحديث</Text>
                  <Icon name="edit" size={18} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
            {/* Nationality */}
            <View style={styles.fieldGroup}>
              <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                {nationalities.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.radioContainer}
                    onPress={() => setNationality(item.value)}
                  >
                    <View style={[styles.radioOuter, nationality === item.value && styles.radioOuterSelected]}>
                      {nationality === item.value && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* ID Number */}
            {nationality === 'citizen' && <View style={styles.fieldGroup}>
              <Text style={styles.label}>رقم الهوية</Text>
              <TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber} placeholder="رقم الهوية" keyboardType="numeric" />
            </View>}
            {/* Gender & Age */}
            <View style={[styles.fieldGroup, styles.row]}>
              <View style={{ width: '48%', }}>
                <Text style={styles.label}>الجنس</Text>
                <Dropdown data={genders} containerStyle={{ height: 50 }} dropdownStyle={{ height: 50 }} value={gender} onChange={(value: string | number) => setGender(value.toString())} placeholder="الجنس" />
              </View>
              <View style={{ width: '48%', }}>
                <Text style={styles.label}>العمر</Text>
                <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="العمر" keyboardType="numeric" />
              </View>
            </View>
            {/* Password Input */}
            <Text style={styles.label}>كلمة المرور</Text>
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
                textContentType='oneTimeCode'
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
            {/* Confirm Password */}
            {/* Password Input */}
            <Text style={styles.label}>تأكيد كلمة المرور</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  isRTL && styles.rtlInput,
                  confirmPasswordError && styles.inputError
                ]}
                placeholder={t('password')}
                value={confirmPassword}
                textContentType='oneTimeCode'
                onChangeText={handleConfirmPasswordChange}
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
            {/* Profile Image Upload */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>اضافة صورة شخصية (اختياري)</Text>
              <View style={styles.fileInputRow}>
                <TouchableOpacity style={styles.chooseFileBtn} onPress={handleFileSelection}>
                  <Text style={styles.chooseFileText}>Choose file</Text>
                </TouchableOpacity>
                {selectedUserImage ? <Text style={styles.noFileText}>{getFileName(selectedUserImage)}</Text> : <Text style={styles.noFileText}>No file chosen</Text>}
              </View>
            </View>
            {/* Save Button */}
            <TouchableOpacity onPress={updateUserProfileHandler} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>حفظ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomBottomSheet
        visible={openPhoneBottomSheet}
        onClose={() => setOpenPhoneBottomSheet(false)}
        showHandle={false}
        height={phoneBottomSheetHeight}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={[styles.modalContainer, { marginTop: 20 }]}>
            <PhoneUpdateComponent
              HandleEmailUpdate={HandlePhoneUpdate}
              handlePhoneNumberChange={HandleChangePhoneNumber}
              mobileNumber={updatedPhoneNumber}
              onClosePress={HandleClosePhoneModal}
              inputError={phoneInputError}
            />
          </View>
        </TouchableWithoutFeedback>
      </CustomBottomSheet>

      <CustomBottomSheet
        visible={openEmailBottomSheet}
        onClose={() => setOpenEmailBottomSheet(false)}
        showHandle={false}
        height={emailBottomSheetHeight}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={[styles.modalContainer, { marginTop: 20 }]}>
            <EmailUpdateComponent
              HandleEmailUpdate={HandleEmailUpdate}
              onChangeText={(text) => {
                setUpdatedEmail(text)
                setEmailInputError(false)
              }}
              value={updatedEmail}
              onClosePress={HandleCloseEmailModal}
              inputError={emailInputError}
            />

          </View>
        </TouchableWithoutFeedback>
      </CustomBottomSheet>

      <Modal
        visible={openVerifyBottomSheet}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setOpenVerifyBottomSheet(false)}
      >

        <SafeAreaView style={{ flex: 1, paddingBottom: 20 }}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>

            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  <VerificationCodeCompoent
                    onClosePress={HandleCloseVerifyModal}
                    otpNumEmail={updatedEmail ? updatedEmail : updatedFullPhoneNumber}
                    userName={name || ''}
                    onChangeText={(text) => setOtpValue(text)}
                    value={otpValue}
                    OtpSubmitButton={HandleOtpSubmit}
                    HandleResendPress={HandleOtpResendButton} />
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </SafeAreaView>

      </Modal>
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setPasswordModalVisible(false); }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: 18, alignItems: 'center', padding: 28, }}>
            <View style={{ width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => { setPasswordModalVisible(false); }}
              >
                <AntDesign name="close" size={28} color="#888" />
              </TouchableOpacity>
              <Text style={{ color: '#3a434a', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>خطأ</Text>
            </View>
            <AntDesign name="exclamationcircle" size={64} color="#d84d48" style={{ marginVertical: 18 }} />
            <Text style={{ color: '#3a434a', fontSize: 18, textAlign: 'center', fontWeight: 'bold', lineHeight: 28 }}>
              {passwordModalMessage}
            </Text>
          </View>
        </View>
      </Modal>
      <FullScreenLoader visible={isUploading} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,

  },
  avatarContainer: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e4f1ef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    // overflow: 'hidden',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e4f1ef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderColor: '#fff',
    alignSelf: 'center',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.medium,
    marginBottom: 4,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 50,
    fontSize: 15,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryCodeBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  updateBtn: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  updateBtnText: {
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 15,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginLeft: 0,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#23a2a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
  },
  radioOuterSelected: {
    borderColor: '#23a2a4',
    backgroundColor: '#e4f1ef',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#23a2a4',
  },
  radioLabel: {
    fontSize: 14,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.medium,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
  },
  fileInputRow: {
    flexDirection: 'row-reverse',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chooseFileBtn: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 8,
    backgroundColor: 'lightgray',
    paddingHorizontal: 12,
    padding: 6
  },
  chooseFileText: {
    color: '#000',
    fontSize: 14,
  },
  noFileText: {
    color: '#888',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  saveBtnText: {
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
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
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: '100%',
    color: '#000',
    fontFamily: CAIRO_FONT_FAMILY.regular,
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
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  dleteIconContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 999,
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    // padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

});

export default UpdateProfileScreen;