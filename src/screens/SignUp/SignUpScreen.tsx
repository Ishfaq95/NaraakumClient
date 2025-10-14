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
    SafeAreaView,
    Modal,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { parsePhoneNumber, AsYouType, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import AppleIcon from '../../assets/icons/AppleIcon';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import CheckIcon from '../../assets/icons/CheckIcon';
import { authService } from '../../services/api/authService';
import { setUser, setToken, setRememberMeRedux } from '../../shared/redux/reducers/userReducer';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenLoader from '../../components/FullScreenLoader';
import { signInWithGoogle } from '../../services/auth/googleAuthService';
import AuthHeader from '../../components/AuthHeader';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import { ROUTES } from '../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import { VerificationCodeCompoent } from '../../components/emailUpdateComponent';
import { profileService } from '../../services/api/ProfileService';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

const MIN_HEIGHT = 550; // Absolute minimum height
const OPTIMAL_HEIGHT = 750; // Height for medium screens

interface Country {
    code: string;
    name: string;
    nameAr: string;
    phoneCode: string;
    flag: string;
}

const SignUpScreen = () => {
    const { height: windowHeight } = useWindowDimensions();
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(false);
    const [otpBottomSheet, setOtpBottomSheet] = useState(false);
    const [otpBottomSheetHeight, setOtpBottomSheetHeight] = useState("35%");
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const isRTL = I18nManager.isRTL;
    const isLargeScreen = windowHeight > OPTIMAL_HEIGHT;
    const isSmallScreen = windowHeight < MIN_HEIGHT;
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<any>({
        code: 'SA',
        name: 'Saudi Arabia',
        nameAr: 'المملكة العربية السعودية',
        flag: '🇸🇦',
        dialCode: '+966',
        pattern: '## ### ####',
        maxLength: 9,
    });
    const [error, setError] = useState(false);
    const [apiError, setAPIError] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [OTPForText, setOTPForText] = useState('')
    const [resentCode, setResentCode] = useState(false)
    const [userInfo, setUserInfo] = useState<any>(null)
    const [otpError, setOTPError] = useState(false)
    const [otpApiError, setOTPApiError] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)
    const [alertModalVisible, setAlertModalVisible] = useState(false)
    const [alertModalMessage, setAlertModalMessage] = useState('')
    const handlePhoneNumberChange = (text: string) => {
        setPhoneNumber(text);
        setError(false); // Clear error when user types
        if (apiError) setAPIError(false);
    };

    const handleKeyboardOpen = () => {
        if (otpBottomSheet) {
            setOtpBottomSheetHeight("65%");
        }
    }

    const handleKeyboardClose = () => {
        if (otpBottomSheet) {
            setOtpBottomSheetHeight("35%");
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
    }, [otpBottomSheet]);

    const handleCountryChange = (country: any) => {
        setSelectedCountry(country);
    };

    const handleLogin = async () => {
        // Dismiss keyboard immediately
        Keyboard.dismiss();

        try {
            setIsLoading(true);
            let hasError = false;

            if (!name.trim()) {
                setNameError(true);
                hasError = true;
            }

            if (!phoneNumber.trim()) {
                setError(true);
                hasError = true;
            }

            const digits = phoneNumber.replace(/\D/g, '');
            if (digits.length !== selectedCountry?.maxLength) {
                setError(true);
                hasError = true;
            }



            if (hasError) {
                setIsLoading(false);
                return;
            }

            const fullNumber = selectedCountry.dialCode + digits;

            let data = {
                "FullNamePlang": name,
                "FullNameSlang": name,
                "CellNumber": fullNumber,
                "RegistrationPlatformId": Platform.OS === 'ios' ? 3 : 2,
                "DeviceId": Platform.OS === 'ios' ? "IOS" : "Android"
            }

            const response = await authService.signUpStep1(data);

            if (response?.ResponseStatus?.STATUSCODE == 200) {
                if (response.StatusCode.STATUSCODE == 3020) {
                    setAlertModalVisible(true)
                    setAlertModalMessage("رقم الجوال موجود مسبقاً")
                    return;
                }
                setOTPForText(fullNumber)
                if (response.Userinfo) {
                    setUserInfo(response.Userinfo)
                }
                setTimeout(() => {
                    setOtpBottomSheet(true)
                }, 500)
            } else {
                Alert.alert(
                    "Error",
                    response?.ResponseStatus?.MESSAGE,
                    [{ text: "OK" }]
                );
            }
            setIsLoading(false);
        } catch (error: any) {
            console.error('Login error:', error);
            setIsLoading(false);
            // Handle login error here (show error message, etc.)
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            const googleUser = await signInWithGoogle();

            if (googleUser) {
                const data = {
                    "FullName": googleUser.name,
                    "Username": googleUser.name,
                    "Email": googleUser.email,
                    "UniqueSocialId": googleUser.id,
                    "RegistrationPlatformId": Platform.OS === 'ios' ? 3 : 2,
                    "RegistrationTypeId": 2,
                    "CatSocialServerId": 1,
                    "CatUserTypeId": 1,
                    "CatNationalityId": 1,
                    "CellNumber": "000000000",
                    "DeviceId": "DDRT56789",
                    "DateofBirth": "1984-09-09"
                }

                // // Call your API to save the Google user data
                const response = await authService.loginWithSocialMedia(data);

                if (response?.ResponseStatus?.STATUSCODE === 200) {
                    setIsLoading(false);
                    dispatch(setUser(response.Userinfo));
                } else {
                    Alert.alert(
                        "Error",
                        response?.ResponseStatus?.MESSAGE,
                        [{ text: "OK" }]
                    );
                }
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

            // Get user info from the identity token
            const decodedToken = JSON.parse(atob(identityToken.split('.')[1]));

            const data = {
                "FullName": fullName?.givenName || decodedToken.email?.split('@')[0] || 'Apple User',
                "Username": email || decodedToken.email || `apple_user_${user}`,
                "Email": email || decodedToken.email,
                "UniqueSocialId": user,
                "RegistrationPlatformId": Platform.OS === 'ios' ? 3 : 2,
                "RegistrationTypeId": 2,
                "CatSocialServerId": 3, // Apple
                "CatUserTypeId": 1,
                "CatNationalityId": 1,
                "CellNumber": "000000000",
                "DeviceId": "DDRT56789",
                "DateofBirth": "1984-09-09"
            };

            // Show loading after Apple Sign In is complete
            setIsLoading(true);

            const response = await authService.loginWithSocialMedia(data);

            if (response?.ResponseStatus?.STATUSCODE === 200) {
                setIsLoading(false);
                dispatch(setUser(response.Userinfo));
            } else {
                Alert.alert(
                    "Error",
                    response?.ResponseStatus?.MESSAGE,
                    [{ text: "OK" }]
                );
            }
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
                        <Text numberOfLines={1} style={styles.socialButtonText}>{t('continue_with_google')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.socialButton, styles.appleButton]}
                        onPress={handleAppleLogin}
                    >
                        <FontAwesome
                            name="apple"
                            size={24}
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

    const HandleCloseVerifyModal = () => {
        setOtpBottomSheet(false)
        setOTPApiError(false)
        setOTPError(false)
        setResentCode(false)
        setOtpValue('')
    }

    const HandleOtpSubmit = async () => {
        setResentCode(false)
        if (otpValue.length < 4) {
            setOTPError(true)
            return;
        }

        try {
            setOtpLoading(true)
            const payload = {
                "UserId": userInfo?.userid,
                "VerificationCode": otpValue,
                "VerificationPlatformId": "1"
            }

            const response = await profileService.verifyUserUpdatedData(payload)
            if (response?.StatusCode?.STATUSCODE == 3007) {
                setOtpBottomSheet(false)
                setOtpValue('')
                navigation.navigate(ROUTES.SignUpProfileScreen, { userInfo: userInfo })
            } else {
                setOTPApiError(true)
            }

        } catch (error) {
        } finally {
            setOtpLoading(false)
        }

    }

    console.log("userInfo", userInfo);

    const HandleOtpResendButton = async () => {
        try {
            setIsLoading(true)
            const payload = {
                "UserId": userInfo?.userid,
            }

            const response = await profileService.resendOtp(payload)
            if (response?.StatusCode?.STATUSCODE == 3009) {
                setResentCode(true)
            }

        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader />
            <FullScreenLoader visible={isLoading || otpLoading} />
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
                                <Text style={globalTextStyles.h3}>
                                    {'حساب جديد'}
                                </Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 20 }}>
                                <Text style={[globalTextStyles.bodySmall, { color: '#666', textAlign: I18nManager.isRTL ? 'left' : 'right' }]}>{'نسعد بنضمامك الى منصة نرعاكم'}</Text>
                                <View style={[styles.inputGroup, { marginTop: 20 }]}>
                                    <View style={styles.questionRow}>
                                        <Text style={styles.questionText}>{'الاسم '}</Text>
                                        <Text style={styles.requiredAsterisk}> *</Text>
                                    </View>
                                    <TextInput
                                        style={[styles.textInput, nameError && styles.inputError]}
                                        placeholder="الاسم الثلاثي"
                                        placeholderTextColor="#999"
                                        textAlign="right"
                                        value={name}
                                        returnKeyType="done"
                                        onChangeText={(text) => {
                                            setName(text);
                                            if (nameError) setNameError(false);
                                        }}
                                    />
                                </View>

                                <View style={[styles.inputGroup]}>
                                    <View style={styles.questionRow}>
                                        <Text style={styles.questionText}>{'رقم الجوال '}</Text>
                                        <Text style={styles.requiredAsterisk}> *</Text>
                                    </View>
                                    <CustomPhoneInput
                                        value={phoneNumber}
                                        onChangeText={handlePhoneNumberChange}
                                        onCountryChange={handleCountryChange}
                                        placeholder="رقم الجوال"
                                        error={error}
                                        initialCountry={selectedCountry}
                                    />
                                </View>

                                <View style={{ width: '100%', paddingHorizontal: 16 }}>
                                    <Text style={styles.termsText}>
                                        بالنقر على "تسجيل" توافق على{' '}
                                        <Text
                                            style={styles.termsLink}
                                            onPress={() => navigation.navigate(ROUTES.PrivacyPolicy as never)}
                                        >
                                            الشروط والأحكام
                                        </Text>
                                        {' '}وسيصل إليك كود التفعيل على جوالك
                                    </Text>
                                </View>

                                {apiError &&
                                    <Text style={{ color: 'red', fontSize: 16, marginTop: 10, textAlign: 'center', fontFamily: globalTextStyles.h5.fontFamily }}>{'رقم الجوال أو كلمة المرور غير صالحة'}</Text>
                                }

                                {/* Login Button */}
                                <TouchableOpacity
                                    onPress={handleLogin}
                                    style={styles.loginButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.loginButtonText}>{'تسجيل'}</Text>
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
                                        ]}>{'أو بواسطة'}</Text>
                                        <View style={styles.orLine} />
                                    </View>

                                    {renderSocialButtons()}

                                    <View style={[styles.signUpContainer]}>
                                        <Text style={[
                                            styles.signUpText,
                                            isLargeScreen && { fontSize: 14 }
                                        ]}>{'يوجد لدي حساب '}</Text>
                                        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.Login)}>
                                            <Text style={[
                                                styles.signUpLink,
                                                isLargeScreen && { fontSize: 14 }
                                            ]}>{'تسجيل دخول'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>


                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <Modal
                visible={otpBottomSheet}
                transparent={true}
                animationType="slide"
                statusBarTranslucent={true}
            // onRequestClose={() => setOtpBottomSheet(false)}
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
                                        OTPFor={OTPForText}
                                        OTPForText={"تغيير الرقم"}
                                        onChangeText={(text) => {
                                            if (text.length > 10) {
                                                return;
                                            }
                                            setOtpValue(text)
                                            setOTPError(false)
                                            setOTPApiError(false)
                                        }}
                                        value={otpValue}
                                        OtpSubmitButton={HandleOtpSubmit}
                                        HandleResendPress={HandleOtpResendButton}
                                        resentCode={resentCode}
                                        headerText={"التحقق من رقم الجوال"}
                                        otpError={otpError}
                                        otpApiError={otpApiError}
                                        isLoading={otpLoading}
                                    />
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={alertModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => { setAlertModalVisible(false); }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: 18, alignItems: 'center', padding: 28, }}>
                        <View style={{ width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                onPress={() => { setAlertModalVisible(false); }}
                            >
                                <AntDesign name="close" size={28} color="#888" />
                            </TouchableOpacity>
                            <Text style={{ color: '#3a434a', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>خطأ</Text>
                        </View>
                        <AntDesign name="exclamationcircle" size={64} color="#d84d48" style={{ marginVertical: 18 }} />
                        <Text style={{ color: '#3a434a', fontSize: 18, textAlign: 'center', fontFamily: CAIRO_FONT_FAMILY.medium, lineHeight: 28 }}>
                            {alertModalMessage}
                        </Text>
                    </View>
                </View>
            </Modal>
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
        ...globalTextStyles.bodySmall,
        color: '#333',
    },
    createAccountText: {
        ...globalTextStyles.bodySmall,
        color: '#008080',
        fontFamily: globalTextStyles.h5.fontFamily,
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
        ...globalTextStyles.bodySmall,
        color: '#666',
    },
    activeTab: {
        backgroundColor: '#eaf6f6'
    },
    activeTabText: {
        ...globalTextStyles.bodySmall,
        color: '#008080',
        fontFamily: globalTextStyles.h5.fontFamily,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        height: 50,
        ...globalTextStyles.bodySmall,
        color: '#000',
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
        ...globalTextStyles.caption,
        color: '#FF3B30',
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
        ...globalTextStyles.bodyMedium,
        marginRight: 8,
    },
    countryCodeText: {
        ...globalTextStyles.bodySmall,
        color: '#333',
        marginRight: 8,
        fontFamily: globalTextStyles.h5.fontFamily,
    },
    countryNameText: {
        ...globalTextStyles.bodySmall,
        color: '#666',
        flex: 1,
    },
    mobileInput: {
        flex: 1,
        padding: 12,
        ...globalTextStyles.bodySmall,
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
        ...globalTextStyles.caption,
        color: '#666',
    },
    forgotPassword: {
        ...globalTextStyles.caption,
        color: '#008080',
        fontFamily: globalTextStyles.h5.fontFamily,
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
        ...globalTextStyles.buttonMedium,
        color: '#FFFFFF',
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
        ...globalTextStyles.label,
        color: '#000',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    signUpText: {
        ...globalTextStyles.caption,
        color: '#666',
    },
    signUpLink: {
        ...globalTextStyles.caption,
        color: '#008080',
        fontFamily: globalTextStyles.h2.fontFamily,
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
        ...globalTextStyles.caption,
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
        ...globalTextStyles.bodySmall,
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
        ...globalTextStyles.bodySmall,
        color: '#333333',
        fontFamily: globalTextStyles.h5.fontFamily,
        flexShrink: 1,
        textAlign: 'center',
    },
    requiredStar: {
        ...globalTextStyles.bodySmall,
        color: '#FF3B30',
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
        fontFamily: CAIRO_FONT_FAMILY.medium,
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
    modalContainer: {
        width: '100%',
        backgroundColor: 'white',
        // padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 0
    },
    termsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 10,
        marginBottom: 15,
    },
    termsText: {
        ...globalTextStyles.bodySmall,
        color: '#666',
        fontFamily: globalTextStyles.h5.fontFamily,
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 20,
    },
    termsLink: {
        color: '#008080',
        fontFamily: globalTextStyles.h2.fontFamily,
        // textDecorationLine: 'underline',
        fontSize: 13,
    },
});

export default SignUpScreen;    