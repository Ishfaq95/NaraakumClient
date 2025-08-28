import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Image, I18nManager, Platform, ScrollView, Alert, Modal, InteractionManager, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../components/common/Dropdown';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import { CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import FullScreenLoader from '../../components/FullScreenLoader';
import { authService } from '../../services/api/authService';
import { setSignUpFlow, setUser } from '../../shared/redux/reducers/userReducer';
import { useDispatch } from 'react-redux';

const genders = [
    { label: 'ذكر', value: 'male' },
    { label: 'أنثى', value: 'female' },
];

const nationalities = [
    { label: 'مواطن (معفى من الضريبة)', value: 'citizen' },
    { label: 'مقيم', value: 'resident' },
];

const SignUpProfileScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const userInfo = route.params.userInfo;
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [nationality, setNationality] = useState('citizen');
    const [idNumber, setIdNumber] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const isRTL = I18nManager.isRTL;
    const [idNumberInputError, setIdNumberInputError] = useState(false);
    const [emailError, setEmailError] = useState(false)
    const [ageError, setAgeError] = useState(false)
    const [passwordNotMatchError, setPasswordNotMatchError] = useState(false)
    // Password validation function
    const validatePassword = (pwd: string) => {
        // At least 8 characters, at least one uppercase, one lowercase, one number, one special character
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        return regex.test(pwd);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text style={styles.headerTitle}>{'اتمام التسجيل'}</Text>
            }
            leftComponent={
                <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
                    <ArrowRightIcon />
                </TouchableOpacity>
            }
            containerStyle={styles.headerContainer}
        />
    );

    const handleSignUpStep2 = async () => {
        if (!email) {
            setEmailError(true)
            return;
        }

        if (age == '') {
            setAgeError(true)
            return;
        }

        if (nationality == 'citizen' && !idNumber) {
            setIdNumberInputError(true)
            return;
        }

        if (password == '') {
            setPasswordError(true)
            return;
        }

        if (confirmPassword == '') {
            setConfirmPasswordError(true)
            return;
        }

        if (password != confirmPassword) {
            setPasswordNotMatchError(true)
            return;
        }

        try {
            setIsUploading(true);
            const payload: any = {
                "UserId": userInfo?.userid,
                "Email": email,
                "Age": age,
                "Gender": gender == 'male' ? 1 : 0,
                "CatNationalityId": nationality == 'citizen' ? 213 : 187,
                "IDNumber": nationality == 'citizen' ? idNumber : '',
                "Password": password,
            }

            const response = await authService.signUpStep2(payload)

            if (response?.ResponseStatus?.STATUSCODE == 200) {
                dispatch(setSignUpFlow(true))
                dispatch(setUser(response.Userinfo));                
            }
        } catch (error: any) {
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
                    <View style={{ width: '100%', padding: 16, alignItems: 'center', paddingVertical: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.medium, color: '#000' }}>مرحبا، </Text>
                            <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.bold, color: '#000' }}>{userInfo?.FullNameSlang}</Text>
                        </View>
                        <Text style={{ fontSize: 16, fontFamily: CAIRO_FONT_FAMILY.medium, color: '#000' }}>الرجاء استكمال معلومات الحساب</Text>
                    </View>
                    <View style={{ paddingHorizontal: 16, marginTop: 20 }}>

                        {/* Email */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>البريد الإلكتروني</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, emailError && { borderWidth: 1, borderColor: 'red' }, { flex: 1, textAlign: 'left' }]}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text)
                                        setEmailError(false)
                                    }}
                                    placeholder="abcd@xyz.com"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>
                        {/* Gender & Age */}
                        <View style={[styles.fieldGroup, styles.row]}>
                            <View style={{ width: '48%', }}>
                                <Text style={styles.label}>الجنس</Text>
                                <Dropdown data={genders} containerStyle={{ height: 50 }} dropdownStyle={{ height: 50 }} value={gender} onChange={(value: string | number) => setGender(value.toString())} placeholder="الجنس" />
                            </View>
                            <View style={{ width: '48%', }}>
                                <Text style={styles.label}>العمر</Text>
                                <TextInput style={[styles.input, ageError && { borderWidth: 1, borderColor: 'red' }]} value={age} onChangeText={(text) => {
                                    setAge(text)
                                    setAgeError(false)
                                }} placeholder="العمر" keyboardType="numeric" />
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
                            {/* <Text style={styles.label}>رقم الهوية</Text> */}
                            <TextInput style={[styles.input, idNumberInputError && { borderWidth: 1, borderColor: 'red' }]} value={idNumber} onChangeText={(text) => {
                                setIdNumber(text)
                                setIdNumberInputError(false)
                            }} placeholder="رقم الهوية" placeholderTextColor="#999" keyboardType="numeric" />
                        </View>}

                        {/* Password Input */}
                        <Text style={styles.label}>كلمة المرور</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[
                                    styles.passwordInput,
                                    isRTL && styles.rtlInput,
                                    passwordError && styles.inputError,
                                    passwordNotMatchError && { borderWidth: 1, borderColor: 'red' }
                                ]}
                                placeholder={"********"}
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
                                    confirmPasswordError && styles.inputError,
                                    passwordNotMatchError && { borderWidth: 1, borderColor: 'red' }
                                ]}
                                placeholder={"********"}
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

                        {passwordNotMatchError && <Text style={{ color: 'red', fontSize: 12, fontFamily: CAIRO_FONT_FAMILY.regular, textAlign: 'center' }}>يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وتتضمن حروفًا أبجدية وأرقامًا ورموزًا خاصة وحرفًا كبيرًا وصغيرًا</Text>}

                        {/* Save Button */}
                        <TouchableOpacity onPress={handleSignUpStep2} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>حفظ</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

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
        top: 3,
        height: 43,
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
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
        fontFamily: CAIRO_FONT_FAMILY.bold,
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
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
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

export default SignUpProfileScreen;