import React from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { CAIRO_FONT_FAMILY } from "../styles/globalStyles";
import PhoneNumberInput from "./PhoneNumberInput";
import { t } from "i18next";

interface EmailUpdateProps {
value:string;
onChangeText:(text:string)=>void;
    HandleEmailUpdate:()=>void;
    onClosePress:()=>void
}

const EmailUpdateComponent:React.FC<EmailUpdateProps> = ({HandleEmailUpdate,onChangeText,value,onClosePress}) => {
    return(
         <View style={styles.mainContainer}>
          <View style={styles.sheetHeaderContainer}>
             <TouchableOpacity onPress={onClosePress}>
              <AntDesign name="close" size={30} color="#979e9eff" />
             </TouchableOpacity>
            <Text style={styles.bottomSheetHeaderText}>تغيير البريد الإلكتروني</Text>
          </View>
          <Text style={styles.emailTitle}>أدخل بريدك الإلكتروني الجديد</Text>
          <View style={styles.inputView}>
             <TextInput value={value} onChangeText={onChangeText} placeholder="abcd@xyz.com" style={styles.inputText} />
          </View>
          <TouchableOpacity onPress={HandleEmailUpdate} style={styles.sheetButton}>
            <Text style={styles.saveBtnText}>حفظ</Text>
          </TouchableOpacity>
        </View>
    )
}



export default EmailUpdateComponent

interface PhoneUpdateProps {
mobileNumber:string;
handlePhoneNumberChange:(data: {
    phoneNumber: string;
    isValid: boolean;
    countryCode: string;
    fullNumber: string;
  })=>void;
    HandleEmailUpdate:()=>void;
    onClosePress:()=>void
}


export const PhoneUpdateComponent:React.FC<PhoneUpdateProps> = ({HandleEmailUpdate,handlePhoneNumberChange,mobileNumber,onClosePress}) => {
    return(
         <View style={styles.mainContainer}>
          <View style={styles.sheetHeaderContainer}>
             <TouchableOpacity onPress={onClosePress}>
              <AntDesign name="close" size={30} color="#979e9eff" />
             </TouchableOpacity>
            <Text style={styles.bottomSheetHeaderText}>تغيير رقم الهااتف</Text>
          </View>
          <Text style={styles.emailTitle}>أدخل رقم هاتفك الجديد</Text>
          <PhoneNumberInput
                      value={mobileNumber}
                      onChangePhoneNumber={handlePhoneNumberChange}
                      placeholder={t('mobile_number')}
                      errorText={t('mobile_number_not_valid')}
                      containerStyle={{marginVertical:7}}
                    />
          <TouchableOpacity onPress={HandleEmailUpdate} style={styles.sheetButton}>
            <Text style={styles.saveBtnText}>حفظ</Text>
          </TouchableOpacity>
        </View>
    )
}

interface smsProps{
    onClosePress:()=>void;
    otpNumEmail:string|number;
    userName:string;
    onChangeText:(text:string)=>void;
    value:string;
    OtpSubmitButton:()=>void;
    HandleResendPress:()=>void
}

export const VerificationCodeCompoent:React.FC<smsProps> = ({onClosePress,otpNumEmail,userName,onChangeText,value,OtpSubmitButton,HandleResendPress}) => {
    return(
        <View style={styles.mainContainer}>
              <TouchableOpacity onPress={onClosePress}>
              <AntDesign name="close" size={30} color="#979e9eff" />
             </TouchableOpacity>

             <Image source={require('../assets/images/sms.png')} style={{width:53,height:53,resizeMode:'contain',alignSelf:'center',marginVertical:10}} />
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

const styles = StyleSheet.create({
    sheetHeaderContainer:{
    flexDirection:'row-reverse',
    alignItems:'center',
    justifyContent:'space-between',
  },
  emailTitle:{
     fontSize:18,
 fontWeight:'200',
 color:'#000',
 textAlign:'left',
 marginTop:20,
 marginBottom:10,

  },
  inputView:{
    width:'100%',
    height:50,
    borderWidth:1,
    borderRadius:8,
    borderColor:'gray',
    marginVertical:4,
    justifyContent:'center',
    alignItems:'flex-start',
    marginBottom:20
  },
  inputText:{
    marginLeft:10
  },
  sheetButton:{
    width:100,
    height:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#23a2a4',
    borderRadius:8,
    alignSelf:'flex-end',
    marginTop:7
  },
    bottomSheetHeaderText:{
 fontSize:24,
 fontWeight:'400',
 color:'#000',

  },
   saveBtnText: {
      color: '#fff',
      fontFamily: CAIRO_FONT_FAMILY.bold,
      fontSize: 18,
    },
    optHeaderText:{
       textAlign:'center',
       fontSize:20,
       marginVertical:8
    },
    inputHeaderText:{
        fontSize:20,
        textAlign:'left'
    },
    otpView:{
         width:'100%',
    height:50,
    borderWidth:1,
    borderRadius:8,
    borderColor:'gray',
    marginVertical:8,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#dcfafcff'
    },
    optButton:{
         width:'100%',
    height:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#23a2a4',
    borderRadius:8,
    alignSelf:'flex-end',
    marginTop:7
    },
    resendOptTextContainer:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:"center",
      marginTop:15
    },
    optNotGet:{
        fontSize:14,
        color:'#000',
        marginRight:5
    },
    resendPress:{
        color:'#23a2a4',
        fontSize:14
    },
    mainContainer:{
        paddingBottom:10
    }
})