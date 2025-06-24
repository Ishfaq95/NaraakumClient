import React from 'react'
import { Text, View } from 'react-native'

const OrderSuccess = ({SuccessResponse}:any) => {
    console.log("SuccessResponse===>",SuccessResponse)
  return (
    <View>
      <Text>OrderSuccess</Text>
    </View>
  )
}

export default OrderSuccess