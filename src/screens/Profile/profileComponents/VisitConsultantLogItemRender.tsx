import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { MediaBaseURL } from '../../../shared/utils/constants';
import moment from 'moment';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';

const VisitConsultantLogItemRender = memo(({ item, getMedicine, getVisitMainRecordDetails,onVisitDetails }: any) => {
    return (
        <View style={styles.card}>
            {/* Top Row: Image and Info */}
            <View style={styles.row}>
                <View style={{width: '75%', alignItems: "flex-start" }}>
                    <Text style={[styles.label, { fontFamily: CAIRO_FONT_FAMILY.medium }]}>اسم المستفيد</Text>
                    <Text style={[styles.beneficiaryName, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>{item?.PatientFullNameSLang}</Text>
                </View>
                <Image
                    source={{ uri: `${MediaBaseURL}${item?.LogoImagePath}` }}
                    style={styles.avatar}
                    resizeMode="cover"
                />
            </View>

            {/* Info Rows */}
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row",width: '40%', alignItems: "center",gap:5 }}>
                    <MaterialIcons name="local-hospital" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>المركز الطبى</Text>
                </View>
                <Text numberOfLines={1} style={[styles.infoText, {width: '60%', fontFamily: CAIRO_FONT_FAMILY.bold }]}>{item?.TitleSlang}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row",width: '40%', alignItems: "center",gap:5 }}>
                    <FontAwesome5 name="user-md" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>مقدم الرعاية</Text>
                </View>
                <Text numberOfLines={1} style={[styles.infoText, {width: '60%', fontFamily: CAIRO_FONT_FAMILY.bold }]}>{item?.FullnameSlang}</Text>

            </View>
            <View style={styles.infoRow}>
            <View style={{ flexDirection: "row",width: '40%', alignItems: "center",gap:5 }}>
            <MaterialIcons name="event" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={[styles.infoText, { fontFamily: CAIRO_FONT_FAMILY.regular }]}>تاريخ الجلسة</Text>
                </View>
                <Text numberOfLines={1} style={[styles.infoText, {width: '60%', fontFamily: CAIRO_FONT_FAMILY.bold }]}>{moment(item?.VisitDate).locale('en').format('DD/MM/YYYY')}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => getVisitMainRecordDetails(item)} style={styles.outlineBtn}>
                    <Text style={[styles.outlineBtnText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>سجل الجلسة</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => getMedicine(item)} disabled={item?.MedicineCount == 0} style={[styles.filledBtn, {opacity: item?.MedicineCount == 0 ? 0.7 : 1, backgroundColor: item?.MedicineCount == 0 ? '#23a2a4' : '#23a2a4' }]}>
                    <Text style={[styles.filledBtnText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>وصفة طبية</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onVisitDetails(item)} style={styles.outlineBtn}>
                    <Text style={[styles.outlineBtnText, { fontFamily: CAIRO_FONT_FAMILY.bold }]}>تفاصيل الطلب</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

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
        width: '100%',
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
        color: 'black',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    beneficiaryName: {
        fontSize: 16,
        color: '#222',
        textAlign: 'left',
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 2,
    },
    icon: {
        marginLeft: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#222',
        textAlign: 'right',
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
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
    filledBtn: {
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    filledBtnText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
    },
});

export default VisitConsultantLogItemRender;
