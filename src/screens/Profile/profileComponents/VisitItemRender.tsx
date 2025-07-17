import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';

const VisitItemRender = ({item}:any) => {
    return (
        <View style={styles.container}>
            <Text style={styles.orderDateText}>{`تاريخ الطلب : ${item.OrderDate}`}</Text>
            <Text style={styles.orderIdText}>{`رقم الطلب : ${item.OrderID}`}</Text>
            <Text style={styles.totalPriceText}>{`اجمالى الفاتورة : ${item.TotalPrice} ريال`}</Text>

            <TouchableOpacity style={styles.detailsButton}>
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