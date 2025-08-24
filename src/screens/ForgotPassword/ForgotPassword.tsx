import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, ScrollView, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { globalTextStyles } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import NewPasswordIcon from '../../assets/icons/NewPasswordIcon';
import { authService } from '../../services/api/authService';
import { ROUTES } from '../../shared/utils/routes';
import FullScreenLoader from '../../components/FullScreenLoader';

const { width } = Dimensions.get('window');



const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<'email' | 'mobile'>('mobile');
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [apiError, setAPIError] = useState(false);
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
    const handleEmailChange = (text: string) => {
        setEmailOrUsername(text);
        if (emailError) setEmailError(false);
        if (apiError) setAPIError(false);
    };

    const handlePhoneNumberChange = (text: string) => {
        setPhoneNumber(text);
        setError(false); // Clear error when user types
        if (apiError) setAPIError(false);
    };

    const handleCountryChange = (country: any) => {
        setSelectedCountry(country);
    };

    const handleContinue = async () => {
        let hasError = false;
        if (activeTab === 'email' && !emailOrUsername.trim()) {
            setEmailError(true);
            hasError = true;
        }

        if (activeTab === 'mobile' && !phoneNumber.trim()) {
            setError(true);
            hasError = true;
        }
        const digits = phoneNumber.replace(/\D/g, '');
        const fullNumber = selectedCountry.dialCode + digits;
        const payload = {
            "Username": activeTab === 'mobile' ? fullNumber : emailOrUsername,
            "Filter": activeTab === 'mobile' ? "mob" : "email"
        }

        setIsLoading(true);
        const response = await authService.forgotPassword(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            navigation.navigate(ROUTES.ForgotOTP, { OTPSend: activeTab === 'mobile' ? fullNumber : emailOrUsername, UserId:response.Data.UserId });
        } else {
            setAPIError(true);
        }
        setIsLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    {/* Icon Container */}
                    <View style={styles.iconContainer}>
                        <NewPasswordIcon />
                    </View>

                    {/* Main Heading */}
                    <Text style={styles.mainHeading}>
                        فقدت كلمة المرور !
                    </Text>

                    {/* Sub Text */}
                    <Text style={styles.subText}>
                        يمكنك تغيير كلمة المرور فقط استخدم الطريقة المناسبة لستلام{' '}
                        <Text style={styles.boldText}>رمز التحقق</Text>
                    </Text>

                </View>
                <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 20 }}>
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
                            <CustomPhoneInput
                                value={phoneNumber}
                                onChangeText={handlePhoneNumberChange}
                                onCountryChange={handleCountryChange}
                                placeholder="Enter phone number"
                                error={error}
                                initialCountry={selectedCountry}
                            />
                        )}
                    </View>

                    {apiError && <Text style={{ color: 'red', fontSize: 12, fontFamily: globalTextStyles.bodySmall.fontFamily, textAlign: 'center', marginTop: 10 }}>{'المستخدم غير موجود'}</Text>}

                    <View style={{ marginTop: 20 }}>
                        <TouchableOpacity style={styles.button} onPress={handleContinue}>
                            <Text style={styles.buttonText}>{'استمرار'}</Text>
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
        ...globalTextStyles.bodyMedium,
        color: '#666', // Gray color as shown in the image
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#000', // Teal color to match the main heading
    },
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
    tab: { flexDirection: 'row', width: '48%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e0e0e0' },
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
    ltrInput: {
        textAlign: 'left',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    button: {
        backgroundColor: '#008080',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...globalTextStyles.bodySmall,
        color: '#fff',
    },
})

export default ForgotPassword