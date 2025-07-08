import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'

const AddMoreService = ({onPressNext,onPressBack}:any) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ height: 100, width: 100, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{height:30,width:30,position:'absolute',top:0,left:-10,zIndex:10, backgroundColor:'#239ea0',borderRadius:20,justifyContent:'center',alignItems:'center'}}>
          <Ionicons name='checkmark' size={25} color='#fff' />
        </View>
        <Ionicons name='cart' size={100} color='#000' />
      </View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>تم إضافة الخدمة الى السلة بنجاح</Text>
      <Text style={{ fontSize: 16, color: '#000' }}>استشارة عن بعد / غسيل كلى منزلي</Text>
      <TouchableOpacity onPress={onPressNext} style={{ backgroundColor: '#239ea0', borderRadius: 10, padding: 12, alignItems: 'center', width: '100%', marginTop: 20 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}> اتمام الحجز</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressBack} style={{ borderWidth: 1, borderColor: '#239ea0', borderRadius: 10, padding: 12, alignItems: 'center', width: '100%', marginTop: 20 }}>
        <Text style={{ color: '#239ea0', fontWeight: 'bold', fontSize: 16 }}>اضافة المزيد من الخدمات</Text>
      </TouchableOpacity>
    </View>
  )
}

export default AddMoreService