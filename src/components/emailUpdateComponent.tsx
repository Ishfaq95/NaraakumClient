import React from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { CAIRO_FONT_FAMILY } from "../styles/globalStyles";
import PhoneNumberInput from "./PhoneNumberInput";
import { t } from "i18next";
import Dropdown from "./common/Dropdown";

interface EmailUpdateProps {
  value: string;
  onChangeText: (text: string) => void;
  HandleEmailUpdate: () => void;
  onClosePress: () => void,
  inputError: boolean
}

const EmailUpdateComponent: React.FC<EmailUpdateProps> = ({ HandleEmailUpdate, onChangeText, value, onClosePress,inputError=false }) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.sheetHeaderContainer}>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={30} color="#979e9eff" />
        </TouchableOpacity>
        <Text style={styles.bottomSheetHeaderText}>تغيير البريد الإلكتروني</Text>
      </View>
      <View style={{ width: '100%', paddingHorizontal: 16 }}>
        <Text style={styles.emailTitle}>أدخل بريدك الإلكتروني الجديد</Text>
        <View style={[styles.inputView,inputError && {borderWidth: 1,borderColor: 'red',borderRadius: 8}]}>
          <TextInput value={value} onChangeText={onChangeText} placeholder="abcd@xyz.com" style={styles.inputText} />
        </View>
        <TouchableOpacity onPress={HandleEmailUpdate} style={styles.sheetButton}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}



export default EmailUpdateComponent

interface PhoneUpdateProps {
  mobileNumber: string;
  handlePhoneNumberChange: (data: {
    phoneNumber: string;
    isValid: boolean;
    countryCode: string;
    fullNumber: string;
  }) => void;
  HandleEmailUpdate: () => void;
  onClosePress: () => void,
  inputError: boolean
}


export const PhoneUpdateComponent: React.FC<PhoneUpdateProps> = ({ HandleEmailUpdate, handlePhoneNumberChange, mobileNumber, onClosePress,inputError=false }) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.sheetHeaderContainer}>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={30} color="#979e9eff" />
        </TouchableOpacity>
        <Text style={styles.bottomSheetHeaderText}>تغيير رقم الهااتف</Text>
      </View>
      <View style={{ width: '100%', paddingHorizontal: 16 }}>
      <Text style={styles.emailTitle}>أدخل رقم هاتفك الجديد</Text>
      <PhoneNumberInput
        value={mobileNumber}
        onChangePhoneNumber={handlePhoneNumberChange}
        placeholder={t('mobile_number')}
        errorText={t('mobile_number_not_valid')}
        containerStyle={[{ marginVertical: 7 },inputError && {borderWidth: 1,borderColor: 'red',borderRadius: 8}]}
      />
      <TouchableOpacity onPress={HandleEmailUpdate} style={styles.sheetButton}>
        <Text style={styles.saveBtnText}>حفظ</Text>
      </TouchableOpacity>
      </View>
    </View>
  )
}

interface smsProps {
  onClosePress: () => void;
  otpNumEmail: string | number;
  userName: string;
  onChangeText: (text: string) => void;
  value: string;
  OtpSubmitButton: () => void;
  HandleResendPress: () => void
}

export const VerificationCodeCompoent: React.FC<smsProps> = ({ onClosePress, otpNumEmail, userName, onChangeText, value, OtpSubmitButton, HandleResendPress }) => {
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity onPress={onClosePress}>
        <AntDesign name="close" size={30} color="#979e9eff" />
      </TouchableOpacity>

      <Image source={require('../assets/images/sms.png')} style={{ width: 53, height: 53, resizeMode: 'contain', alignSelf: 'center', marginVertical: 10 }} />
      <Text style={styles.optHeaderText}>تم ارسال رمز التحقق الى جوالك رقم</Text>
      <Text style={styles.optHeaderText}>{otpNumEmail}</Text>
      <Text style={styles.optHeaderText}>{userName}</Text>
      <Text style={styles.inputHeaderText}>ادخل رمز التحقق *</Text>
      <View style={styles.otpView}>
        <TextInput value={value} onChangeText={onChangeText} placeholder="0000" style={styles.inputText} />
      </View>
      <TouchableOpacity onPress={OtpSubmitButton} style={styles.optButton}>
        <Text style={styles.saveBtnText}>حفظ</Text>
      </TouchableOpacity>
      <View style={styles.resendOptTextContainer}>
        <Text style={styles.optNotGet}>لم يصلني الكود</Text>
        <TouchableOpacity onPress={HandleResendPress}>
          <Text style={styles.resendPress}>إعادة الارسال</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

interface AddressProps {
  onClosePress: () => void;
  setRiginValue: (text: string) => void;
  riginValue: string;
  setCityValue: (text: string) => void;
  cityValue: string;
  setNeighbearhoodValue: (text: string) => void;
  neighbearhoodValue: string;
  setDescriptionValue: (text: string) => void;
  descriptionValue: string;
  saveAddressButton: () => void;
  GoogleMapButton: () => void
}

export const VisitLocationComponent: React.FC<AddressProps> = ({
  onClosePress,
  setRiginValue,
  riginValue,
  setCityValue,
  cityValue,
  setDescriptionValue,
  descriptionValue,
  setNeighbearhoodValue,
  neighbearhoodValue,
  saveAddressButton,
  GoogleMapButton
}) => {
  const Neighbearhood = [
    { label: '', value: '' },
  ];

  const Rigin = [
    { label: 'اختر من فضلك', value: 'rajhi' },
    { label: 'الرياض', value: 'bupa' },
  ];

  const City = [
    { label: 'اختر من فضلك', value: '1' },
    { label: 'الرياض', value: '2' },
  ];


  return (
    <>
      <View style={styles.sheetHeaderContainer}>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={30} color="#979e9eff" />
        </TouchableOpacity>
        <Text style={styles.bottomSheetHeaderText}>اختر موقع الزيارة</Text>
      </View>
      <Text style={{ textAlign: 'center', fontSize: 24, color: '#000' }}>نقدم خدماتنا فى المناطق والمدن التالية</Text>
      <View style={styles.whiteContainer}>

        <Text style={styles.titleText}>أختر المنطقة <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          data={Rigin}
          containerStyle={{ height: 50 }}
          dropdownStyle={{ height: 50 }}
          value={riginValue}
          onChange={(value: string | number) => setRiginValue(value.toString())}
          placeholder=""
        />

        <Text style={styles.titleText}>أختر المدينة <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          data={City}
          containerStyle={{ height: 50 }}
          dropdownStyle={{ height: 50 }}
          value={cityValue}
          onChange={(value: string | number) => setCityValue(value.toString())}
          placeholder=""
        />

        <Text style={styles.titleText}>أختر الحى <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          data={Neighbearhood}
          containerStyle={{ height: 50 }}
          dropdownStyle={{ height: 50 }}
          value={neighbearhoodValue}
          onChange={(value: string | number) => setNeighbearhoodValue(value.toString())}
          placeholder="اختر الجنس"
        />

        <Text style={styles.titleText}>وصف العنوان <Text style={{ color: 'red' }}>*</Text></Text>
        <View style={styles.inputView}>
          <TextInput
            style={[styles.fullWidthInput]}
            placeholder="اسم المستفيد"
            value={descriptionValue}
            onChangeText={setDescriptionValue}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={saveAddressButton} style={styles.optButton}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={GoogleMapButton} style={styles.googleButton}>
          <Text style={[styles.saveBtnText, { color: '#000', fontWeight: '300' }]}>استخدم خرائط Google</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};


interface beneficiaryProps {
  onClosePress: () => void;
  onChangeTextName: (text: string) => void;
  nameValue: string;
  onChangeTextRelation: (text: string) => void;
  relationValue: string;
  onChangeTextAge: (text: string) => void;
  ageValue: string;
  onChangeTextGender: (text: string) => void;
  genderValue: string;
  onChangeTextInsurance: (text: string) => void;
  insuranceValue: string;
  PressNationality: (item: string) => void;
  nationality: string;
  SubmitButton: () => void;
}

export const AddBeneficiaryComponent: React.FC<beneficiaryProps> = ({
  onClosePress,
  onChangeTextName,
  nameValue,
  onChangeTextRelation,
  relationValue,
  onChangeTextAge,
  ageValue,
  onChangeTextGender,
  genderValue,
  onChangeTextInsurance,
  insuranceValue,
  PressNationality,
  nationality,
  SubmitButton
}) => {
  const nationalities = [
    { label: 'مواطن (معفى من الضريبة)', value: 'citizen' },
    { label: 'مقيم', value: 'resident' },
  ];

  const genders = [
    { label: 'ذكر', value: 'male' },
    { label: 'أنثى', value: 'female' },
  ];

  const insurances = [
    { label: 'تكافل الراجحي', value: 'rajhi' },
    { label: 'شركة بوبا', value: 'bupa' },
  ];

  const Relation = [
    { label: 'أب', value: '1' },
    { label: 'الأم', value: '2' },
    { label: 'ابن', value: '3' },
    { label: 'زوجة', value: '4' },
    { label: 'بنت', value: '5' },
    { label: 'صديق', value: '6' },
  ];


  return (
    <>
      <View style={styles.sheetHeaderContainer}>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={30} color="#979e9eff" />
        </TouchableOpacity>
        <Text style={styles.bottomSheetHeaderText}>تغيير رقم الهاتف</Text>
      </View>

      <View style={styles.whiteContainer}>
        {/* Name */}
        <Text style={styles.titleText}>اسم المستفيد <Text style={{ color: 'red' }}>*</Text></Text>
        <View style={styles.inputView}>
          <TextInput
            style={[styles.fullWidthInput]}
            placeholder="اسم المستفيد"
            value={nameValue}
            onChangeText={onChangeTextName}
          />
        </View>

        {/* Relation */}
        <Text style={styles.titleText}>صلة القرابة <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          data={Relation}
          containerStyle={{ height: 50 }}
          dropdownStyle={{ height: 50 }}
          value={relationValue}
          onChange={(value: string | number) => onChangeTextRelation(value.toString())}
          placeholder="اختر الجنس"
        />

        {/* Age */}
        <Text style={styles.titleText}>العمر / سنة</Text>
        <View style={[styles.inputView, { alignItems: 'flex-end' }]}>
          <TextInput
            style={[styles.fullWidthInput, { textAlign: 'right' }]}
            placeholder="0"
            placeholderTextColor="#1e2525ff"
            keyboardType="numeric"
            value={ageValue}
            onChangeText={onChangeTextAge}
          />
        </View>

        {/* Gender Dropdown */}
        <Text style={styles.titleText}>الجنس</Text>
        <Dropdown
          data={genders}
          containerStyle={{ height: 50 }}
          dropdownStyle={{ height: 50 }}
          value={genderValue}
          onChange={(value: string | number) => onChangeTextGender(value.toString())}
          placeholder="اختر الجنس"
        />

        {/* Insurance Dropdown */}
        <Text style={styles.titleText}>شركة التأمين</Text>
        <Dropdown
          data={insurances}
          containerStyle={{ height: 50 }}
          dropdownStyle={{ height: 50 }}
          value={insuranceValue}
          onChange={(value: string | number) => onChangeTextInsurance(value.toString())}
          placeholder="اختر شركة التأمين"
        />

        {/* Nationality Radio */}
        <View style={styles.fieldGroup}>
          <View style={[styles.row, { justifyContent: 'flex-start' }]}>
            {nationalities.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.radioContainer}
                onPress={() => PressNationality(item.value)}
              >
                <View style={[styles.radioOuter, nationality === item.value && styles.radioOuterSelected]}>
                  {nationality === item.value && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={SubmitButton} style={styles.optButton}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};


const styles = StyleSheet.create({
  sheetHeaderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E4F1EF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  emailTitle: {
    fontSize: 18,
    fontFamily: CAIRO_FONT_FAMILY.light,
    color: '#000',
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 10,

  },
  inputView: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e0dedeff',
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  inputText: {
    marginLeft: 10,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontSize: 16,
    color: '#000'
  },
  sheetButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 7
  },
  bottomSheetHeaderText: {
    fontSize: 24,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000',

  },
  saveBtnText: {
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 18,
  },
  optHeaderText: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    marginVertical: 8,
    color: '#000'
  },
  inputHeaderText: {
    fontSize: 20,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    textAlign: 'left',
    color: '#000'
  },
  otpView: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'gray',
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dcfafcff'
  },
  optButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 7
  },
  googleButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#23a2a4',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 20
  },
  resendOptTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    marginTop: 15
  },
  optNotGet: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000',
    marginRight: 5
  },
  resendPress: {
    color: '#23a2a4',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.medium
  },
  mainContainer: {
    width: '100%',
    paddingBottom: 10
  },
  whiteContainer: {
    padding: 20,
    alignItems: 'flex-start',
  },
  titleText: {
    color: '#36454F',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    marginVertical: 10
  },
  inputViewWithDropdown: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'gray',
    marginVertical: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  fieldGroup: {
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  fullWidthInput: {
    flex: 1,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000'
  }
})