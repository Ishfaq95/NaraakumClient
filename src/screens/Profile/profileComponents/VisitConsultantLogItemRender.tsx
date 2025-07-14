import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { MediaBaseURL } from '../../../shared/utils/constants';
import moment from 'moment';

const VisitConsultantLogItemRender = ({ item }: any) => {
    return (
        <View style={styles.card}>
            {/* Top Row: Image and Info */}
            <View style={styles.row}>
                <View style={{ alignItems: "flex-start" }}>
                    <Text style={styles.label}>اسم المستفيد</Text>
                    <Text style={styles.beneficiaryName}>{item?.PatientFullNameSLang}</Text>
                </View>
                <Image
                    source={{ uri: `${MediaBaseURL}${item?.LogoImagePath}` }} // Replace with real image
                    style={styles.avatar}
                />
            </View>

            {/* Info Rows */}
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center",gap:5 }}>
                    <MaterialIcons name="local-hospital" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={styles.infoText}>المركز الطبى</Text>
                </View>
                <Text style={styles.infoText}>{item?.TitleSlang}</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center",gap:5 }}>
                    <FontAwesome5 name="user-md" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={styles.infoText}>مقدم الرعاية</Text>
                </View>
                <Text style={styles.infoText}>{item?.FullnameSlang}</Text>

            </View>
            <View style={styles.infoRow}>
            <View style={{ flexDirection: "row", alignItems: "center",gap:5 }}>
            <MaterialIcons name="event" size={16} color="#23a2a4" style={styles.icon} />
                    <Text style={styles.infoText}>تاريخ الجلسة</Text>
                </View>
                <Text style={styles.infoText}>{moment(item?.VisitDate).format('DD/MM/YYYY')}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.outlineBtn}>
                    <Text style={styles.outlineBtnText}>سجل الجلسة</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filledBtn}>
                    <Text style={styles.filledBtnText}>وصفة طبية</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineBtn}>
                    <Text style={styles.outlineBtnText}>تفاصيل الطلب</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

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
    },
    beneficiaryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'left',
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
    },
    filledBtn: {
        backgroundColor: '#23a2a4',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    filledBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default VisitConsultantLogItemRender;
