import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { MediaBaseURL } from '../../../shared/utils/constants';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../../shared/utils/routes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { profileService } from '../../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const ReservationReceivedItemRender = ({ item, onClickOrderDetails, getUpdatedOrders }: any) => {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const user = useSelector((state: any) => state.root.user.user);
    
    const handleAddMoreServices = useCallback(() => {
        navigation.navigate(ROUTES.AppNavigator, {
            screen: ROUTES.HomeStack,
            params: {
                screen: ROUTES.Services,
            }
        });
    }, [navigation]);

    const handleDeleteOrder = useCallback(async (orderItem: any) => {
        const payload = {
            "UserLoginInfoId": user?.Id,
            "OrderId": orderItem?.OrderID,
        }

        const response = await profileService.deleteOrderAddedByServiceProvider(payload);
        if (response?.ResponseStatus?.STATUSCODE == 200) {
            getUpdatedOrders();
        }
        
    }, [user?.Id]);

    const handleOrderDetails = useCallback(() => {
        onClickOrderDetails(item);
    }, [onClickOrderDetails, item]);

    const formattedDate = useMemo(() => moment(item?.OrderDate).locale('en').format('DD/MM/YYYY'), [item?.OrderDate]);
    const totalPriceText = useMemo(() => `SAR ${item?.TotalPrice}`, [item?.TotalPrice, t]);
    const showDeleteButton = useMemo(() => item?.CatOrderStatusId == '22', [item?.CatOrderStatusId]);
    const showAddMoreButton = useMemo(() => item?.CatOrderStatusId == '22', [item?.CatOrderStatusId]);

    return useMemo(() => (
        <View style={styles.card}>
            {/* Top Row: Image and Info */}
            <View style={styles.row}>
                <View style={{ alignItems: "flex-start" }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#000' }]}>اسم المستفيد</Text>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }]}>{item?.PatientFullnameSlang}</Text>
                </View>
                {showDeleteButton && <TouchableOpacity onPress={() => handleDeleteOrder(item)} style={{}}>
                    <MaterialCommunityIcons name="delete" size={24} color="red" />
                </TouchableOpacity>}
            </View>

            {/* Info Rows */}
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="hash" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>رقم الطلب</Text>
                </View>
                <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>{item?.OrderID}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <MaterialCommunityIcons name="calendar-range-outline" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>تاريخ الاستلام</Text>
                </View>
                <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <MaterialCommunityIcons name="office-building-outline" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>جهة الارسال</Text>
                </View>
                <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>{item?.CPFullnameSlang}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <MaterialCommunityIcons name="stethoscope" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>عدد الخدمات</Text>
                </View>
                <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>{item?.TotalServices}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <FontAwesome6 name="receipt" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>اجمالى الفاتورة</Text>
                </View>
                <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>{totalPriceText}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                {showAddMoreButton && <TouchableOpacity onPress={handleAddMoreServices} style={styles.filledBtn}>
                    <Text style={[styles.filledBtnText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>إضافة مزيد من الخدمات</Text>
                </TouchableOpacity>}
                <TouchableOpacity onPress={handleOrderDetails} style={[styles.filledBtn]}>
                    <Text style={[styles.filledBtnText, { fontFamily: globalTextStyles.buttonMedium.fontFamily }]}>التفاصيل / اتمام الحجز</Text>
                </TouchableOpacity>
            </View>
        </View>
    ), [
        item?.PatientFullnameSlang,
        item?.OrderID,
        item?.CPFullnameSlang,
        item?.TotalServices,
        formattedDate,
        totalPriceText,
        showDeleteButton,
        showAddMoreButton,
        handleDeleteOrder,
        handleAddMoreServices,
        handleOrderDetails
    ]);
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        minWidth: 220,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginLeft: 12,
        backgroundColor: '#eee',
    },
    label: {
        fontSize: 12,
        color: '#888',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    beneficiaryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'left',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    icon: {
        marginLeft: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#222',
        textAlign: 'left',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    buttonRow: {
        flexDirection: 'column',
        marginTop: 12,
        gap: 8,
    },
    outlineBtn: {
        borderWidth: 1,
        borderColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    outlineBtnText: {
        color: '#23a2a4',
        fontWeight: 'bold',
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    filledBtn: {
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        width: '100%',
    },
    filledBtnText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
});

export default ReservationReceivedItemRender