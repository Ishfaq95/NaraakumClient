import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { globalTextStyles } from '../../styles/globalStyles'

const AddMoreService = ({onPressNext,onPressBack}:any) => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    handleAddMoreService()
  }, [])

  const handleAddMoreService = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 100)
  }

  if(isLoading){
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ height: 100, width: 100, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{height:30,width:30,position:'absolute',top:0,left:-10,zIndex:10, backgroundColor:'#239ea0',borderRadius:20,justifyContent:'center',alignItems:'center'}}>
          <Ionicons name='checkmark' size={25} color='#fff' />
        </View>
        <Ionicons name='cart' size={100} color='#000' />
      </View>
      <Text style={[globalTextStyles.h4, { color: '#000' }]}>تم إضافة الخدمة الى السلة بنجاح</Text>
      <Text style={[globalTextStyles.bodyMedium, { color: '#000' }]}>استشارة عن بعد / غسيل كلى منزلي</Text>
      <TouchableOpacity onPress={onPressNext} style={{ backgroundColor: '#239ea0', borderRadius: 10, padding: 12, alignItems: 'center', width: '100%', marginTop: 20 }}>
        <Text style={[globalTextStyles.buttonMedium, { color: '#fff' }]}> اتمام الحجز</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressBack} style={{ borderWidth: 1, borderColor: '#239ea0', borderRadius: 10, padding: 12, alignItems: 'center', width: '100%', marginTop: 20 }}>
        <Text style={[globalTextStyles.buttonMedium, { color: '#239ea0' }]}>اضافة المزيد من الخدمات</Text>
      </TouchableOpacity>
    </View>
  )
}

export default AddMoreService