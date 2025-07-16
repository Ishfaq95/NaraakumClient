import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { globalTextStyles } from '../../styles/globalStyles'

const PackageListDetails = ({ selectedOrganization, onPressNext, onPressBack }: any) => {

  const packageListArray = [
    {
      id: 1,
      title: 'استشارة طبية عن بعد لتقييم مناسبة الحالة الصحية للغسيل المنزلي',
      description: 'الاستشارة الطبية عن بعد قبل بدء غسيل الكلى المنزلي تعد خطوة ضرورية لانها تساعد الطبيب في تحديد مدى مناسبة غسيل الكلى المنزلي لحالتك.',
    },
    {
      id: 2,
      title: 'زيارة منزلية لفحص المريض و تحديد جاهزية المنزل',
      description: 'سيقوم الطبيب بالفحص عليك فى المنزل كما سيقوم الطبيب والفريق المصاحب من التأكد من جاهزية المنزل لتركيب جهاز الغسيل وجهاز تحلية المياه مع اخذ العينات',
    },
    {
      id: 3,
      title: 'حجز إحدى باقات غسيل الكلى',
      description: `في حال كان المنزل مناسبًا، يمكنك حجز احدى باقات خدمة غسيل الكلى المنزلى
سعر الجلسة يبدأ من : ${selectedOrganization?.RemoteSessionStartPrice} ريال حسب الباقة`,
    },

  ]

  return (
    <View style={{ flex: 1 }}>
      <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', textAlign: 'left' }]}>التعليمات</Text>
      <View style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#fff', textAlign: 'left' }]}>خطوات حجز خدمة غسيل الكلى المنزلي</Text>
      </View>
      <ScrollView style={{ flex: 1, marginTop: 10 }}>
        {packageListArray.map((item) => (
          <View key={item.id} style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', width: '10%', height: '100%', paddingTop: 10 }}>
                <View style={{ height: 20, width: 20, backgroundColor: '#eceff4', borderRadius: 10,alignItems:'center',justifyContent:'center' }}>
                  <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', textAlign: 'left' }]}>{item.id}</Text>
                </View>

              </View>
              <View style={{ width: '90%' }}>
                <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#239ea0', textAlign: 'left' }]}>{item.title}</Text>
                <Text style={[globalTextStyles.bodySmall, { color: '#000', textAlign: 'left' }]}>{item.description}</Text>
              </View>
            </View>

          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default PackageListDetails