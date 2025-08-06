import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../../shared/utils/routes";
import moment from "moment";

const VisitItemRender = ({item}:any) => {
    const navigation = useNavigation();
    const handleDetails = (item: any) => {
        navigation.navigate(ROUTES.OrderDetailScreen, {OrderId:item.OrderID });
    }
    return (
        <View style={styles.container}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={{fontSize:16,fontFamily:CAIRO_FONT_FAMILY.medium,color:"#000"}}>{`تاريخ الطلب : `}</Text>
                <Text style={styles.orderDateText}>{` ${moment(item.OrderDate).locale('en').format('DD/MM/YYYY')}`}</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={{fontSize:16,fontFamily:CAIRO_FONT_FAMILY.medium,color:"#000"}}>{`رقم الطلب :`}</Text>
                <Text style={styles.orderDateText}>{`${item.OrderID}`}</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={{fontSize:16,fontFamily:CAIRO_FONT_FAMILY.medium,color:"#000"}}>{`اجمالى الفاتورة : `}</Text>
                <Text style={styles.orderDateText}>{`SAR ${item.TotalPrice}`}</Text>
            </View>

            <TouchableOpacity onPress={() => handleDetails(item)} style={styles.detailsButton}>
                <Text style={styles.buttonText}>تفاصيل الطلب</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 190,
        width: '100%',
        backgroundColor: "#e4f1ef",
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        alignItems: "flex-start"
    },
    orderDateText: {
        fontSize: 16,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: "#000"
    },
    orderIdText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: "#000"
    },
    totalPriceText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: "#000"
    },
    detailsButton: {
        width: "100%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#008080",
        padding: 10,
        borderRadius: 10,
        marginTop: 20
    },
    buttonText: {
        fontSize: 14,
        fontFamily: CAIRO_FONT_FAMILY.bold,
        color: "#fff"
    }
});

export default VisitItemRender;