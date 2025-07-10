import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Image, I18nManager, Platform, ScrollView } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Dropdown from '../../components/common/Dropdown';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import { MediaBaseURL } from '../../shared/utils/constants';

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
  const isRTL = I18nManager.isRTL;
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

  console.log("user", user);

  useEffect(() => {
    setName(user?.FullnameSlang);
    setEmail(user?.Email);
    setAge(user?.Age);
    setGender(user?.Gender);
    if(user?.Gender==1){
      setGender('male');
    }else {
      setGender('female');
    }
    if(user?.CatNationalityId==213){
      setNationality('citizen');
    }else {
      setNationality('resident');
    }
    setIdNumber(user?.IDNumber);
  }, [user]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePhoneNumberChange = (data: { phoneNumber: string; isValid: boolean; countryCode: string; fullNumber: string }) => {
    setMobileNumber(data.phoneNumber);
    setIsValidNumber(data.isValid);
    setFullNumber(data.fullNumber);
  };

  const handleChooseFile = () => {
    // Placeholder for file picker
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

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollContent}>
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user?.ImagePath ? <Image source={{ uri: `${MediaBaseURL}${user?.ImagePath}` }} style={{height:'100%',width:'100%',borderRadius:45}} /> :
              <View style={styles.avatarCircle}>
                <AntDesign name="user" size={64} color="#23a2a4" />
              </View>}
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
                value={defaultPhoneNumber}
                onChangePhoneNumber={handlePhoneNumberChange}
                placeholder={t('mobile_number')}
                errorText={t('mobile_number_not_valid')}
                defaultCountry={defaultCountryCode}
                editable={false}
              />
              <TouchableOpacity style={styles.updateBtn}>
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
              <TouchableOpacity style={styles.updateBtn}>
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
          {/* Confirm Password */}
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
          {/* Profile Image Upload */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>اضافة صورة شخصية (اختياري)</Text>
            <View style={styles.fileInputRow}>
              <TouchableOpacity style={styles.chooseFileBtn} onPress={handleChooseFile}>
                <Text style={styles.chooseFileText}>Choose file</Text>
              </TouchableOpacity>
              <Text style={styles.noFileText}>No file chosen</Text>
            </View>
          </View>
          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>حفظ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    overflow: 'hidden',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e4f1ef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
    alignSelf: 'center',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
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
    fontWeight: 'bold',
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
    fontWeight: '500',
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
    height: 50,
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
    paddingVertical: 8,
  },
  chooseFileText: {
    color: '#000',
    fontSize: 14,
  },
  noFileText: {
    color: '#888',
    fontSize: 14,
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
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  rtlInput: {
    textAlign: 'right',
    paddingRight: 12,
    paddingLeft: 12,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
});

export default UpdateProfileScreen;