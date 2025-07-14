import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const VisitItemRender = ({item}:any) => {
    return (
        <View style={{height:190,width:'100%', backgroundColor:"#e4f1ef",borderRadius:10,padding:16, marginBottom:10,alignItems:"flex-start"}}>
            <Text style={{fontSize:16,fontWeight:"bold",color:"#000"}}>{`تاريخ الطلب : ${item.OrderDate}`}</Text>
            <Text style={{fontSize:14,fontWeight:"bold",color:"#000"}}>{`رقم الطلب : ${item.OrderID}`}</Text>
            <Text style={{fontSize:14,fontWeight:"bold",color:"#000"}}>{`اجمالى الفاتورة : ${item.TotalPrice} ريال`}</Text>

            <TouchableOpacity style={{width:"100%",height:50, alignItems:"center",justifyContent:"center", backgroundColor:"#008080",padding:10,borderRadius:10,marginTop:20}}>
                <Text style={{fontSize:14,fontWeight:"bold",color:"#fff"}}>تفاصيل الطلب</Text>
            </TouchableOpacity>
        </View>
    )
}

export default VisitItemRender;