import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Foundation from 'react-native-vector-icons/Foundation'
import { globalTextStyles } from '../../styles/globalStyles'
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';

const OrderNotCompleted = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const renderHeader = () => (
        <Header
            centerComponent={
                <Text style={styles.headerTitle}>{t('booking_failed')}</Text>
            }
            containerStyle={styles.headerContainer}
        />
    );
    return (
        <SafeAreaView style={{ flex: 1 }}>
            {renderHeader()}
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 100, paddingHorizontal: 20 }}>
                <Foundation name='alert' size={100} color='#dc3545' />
                <Text style={{ ...globalTextStyles.h4, color: '#000', marginTop: 20 }}>{'فشل الدفع. يُرجى المحاولة مرة أخرى.'}</Text>

                <TouchableOpacity style={{ backgroundColor: '#23a2a4', padding: 10, borderRadius: 10, marginTop: 20, width: '100%', alignItems: 'center', justifyContent: 'center', height: 50 }}
                    onPress={() => {
                        (navigation as any).navigate(ROUTES.AppNavigator, {
                            screen: ROUTES.HomeStack,
                            params: {
                                screen: ROUTES.BookingScreen,
                                params: {
                                    currentStep: 4,
                                }
                            }
                        });
                    }}>
                    <Text style={{ ...globalTextStyles.buttonLarge, color: '#fff' }}>{'إتمام الدفع'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    headerTitle: {
        ...globalTextStyles.h3,
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
})

export default OrderNotCompleted