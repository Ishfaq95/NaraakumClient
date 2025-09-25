import { View, Text, ScrollView, FlatList } from 'react-native'
import React, { useCallback, useState } from 'react'
import HomeDialysisServiceProvider from '../bookingSteps/HomeDialysisServiceProvider'
import { useSelector } from 'react-redux'
import { globalTextStyles } from '../../styles/globalStyles'

const DoctorListing = ({ filteredProviders, selectedDate, availability, onPressNext, onPressBack }: any) => {

  const [selectedSlotInfo, setSelectedSlotInfo] = useState<any>(null);
  const CardArray = useSelector((state: any) => state.root.booking.homeDialysisCardItems);
  console.log("filteredProviders",filteredProviders)

  const handleSelectSlot = useCallback((provider: any, slot: any) => {

    setSelectedSlotInfo({
      providerId: provider.UserId,
      slotTime: slot.start_time
    });
  }, [selectedSlotInfo, CardArray]);
  
  return (
    <View style={{ flex: 1 }}>
      <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', textAlign: 'left' }]}>حجز موعد </Text>
      {/* <View style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#fff', textAlign: 'left' }]}>حدد موعد الاستشارة الطبية عن بعد</Text>
      </View> */}
      <View style={{ flex: 1, marginTop: 10 }}>
        <FlatList
          data={filteredProviders}
          renderItem={({ item }) => {
            const providerAvailability = availability.flatMap(avail =>
              avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
            );

            return <HomeDialysisServiceProvider provider={item} selectedDate={selectedDate} availability={providerAvailability} onSelectSlot={handleSelectSlot} selectedSlotInfo={selectedSlotInfo} />
          }}
        />
      </View>
    </View>
  )
}

export default DoctorListing