import React from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import LottieAnimation from '../common/LottieAnimation'
import { LOTTIE_ANIMATIONS } from '../../assets/animation'
import { generateAndDownloadInvoice } from '../../services/InvoiceService'
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import moment from 'moment';

const OrderSuccess = ({ navigation, SuccessResponse }: any) => {
  const { t } = useTranslation();

  const handleDownloadInvoice = async () => {
    try {
      // if (SuccessResponse && SuccessResponse.Data) {
        const invoiceData = {
          OrderId: '000000',
          TitleSlangService: 'خدمة طبية',
          TitleSlangSpecialty: '',
          CardNumber: '',
          TaxAmt: 0,
          ServiceCharges: 0,
          ServicePrice: 0,
          ServiceProviderSName: 'مقدم الخدمة',
          SchedulingDate: new Date().toISOString(),
          SchedulingTime: '00:00',
          PatientSName: 'المريض',
          PatientPhone: '+966000000000',
          PatientEmail: 'patient@example.com',
        };

        // Generate and download the invoice
         await generateAndDownloadInvoice(invoiceData);
        
        // Show success message
        // Alert.alert(
        //   'تم التحميل بنجاح',
        //   'تم حفظ الفاتورة في مجلد المستندات',
        //   [
        //     {
        //       text: 'حسناً',
        //       onPress: () => {
        //         // Navigate to appointment tab after successful download
        //         navigation.reset({
        //           index: 0,
        //           routes: [{ name: 'MainTabNavigator', params: { screen: 'AppointmentTab' } }],
        //         });
        //       }
        //     }
        //   ]
        // );
        
      // } else {
      //   Alert.alert('خطأ', 'لا توجد بيانات الفاتورة متاحة');
      // }
    } catch (error) {
      console.error('Error generating invoice:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الفاتورة');
    }
  };

  const handleTrackOrder = () => {
    navigation.navigate(ROUTES.AppNavigator, {
      screen: ROUTES.HomeStack,
      params: {
        screen: ROUTES.AppointmentListScreen,
      }
    });
  };

  const handleBackToHome = () => {
    navigation.navigate(ROUTES.AppNavigator, {
      screen: ROUTES.HomeStack,
      params: {
        screen: ROUTES.AppointmentListScreen,
      }
    });
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('booking_successful')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBackToHome} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{flex:1,paddingHorizontal:16,alignItems:"center", }}>
        <Text>Order Success</Text>
        {/* <View style={styles.gifContainer}>
          <LottieAnimation
            source={LOTTIE_ANIMATIONS.ORDER_SUCCESS}
            style={styles.successLottie}
            autoPlay
            loop
          />
        </View>
        <View style={{ alignItems:"center",justifyContent:"center",marginBottom:15}}>
          <Text style={{fontSize:22,fontWeight:"700",color:"#000"}}>{t('booking_successful')}</Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={{fontSize:16,fontWeight:'bold',color:"#23a2a4"}}>{t('transaction_status')}</Text>
          <Text style={{fontSize:14,fontWeight:"600",color:"#23a2a4"}}>{t('تمت العملية بنجاح')}</Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={{fontSize:16,fontWeight:'bold',color:"#23a2a4"}}>{t('transaction_number')}</Text>
          <Text style={{fontSize:14,fontWeight:"600",color:"#23a2a4"}}>
            {SuccessResponse?.Data?.OrderId ? `NAR-${SuccessResponse.Data.OrderId}` : 'N/A'}
          </Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={{fontSize:16,fontWeight:'bold',color:"#23a2a4"}}>{t('transaction_date')}</Text>
          <Text style={{fontSize:14,fontWeight:"600",color:"#23a2a4"}}>
            {SuccessResponse?.Data?.CreatedDate ? moment(SuccessResponse.Data.CreatedDate).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}
          </Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={{fontSize:16,fontWeight:'bold',color:"#23a2a4"}}>{t('transaction_amount')}</Text>
          <Text style={{fontSize:14,fontWeight:"600",color:"#23a2a4"}}>
            {SuccessResponse?.Data?.TotalAmount ? `${SuccessResponse.Data.TotalAmount} SAR` : 'N/A'}
          </Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8,paddingTop:30 }}>
          <TouchableOpacity 
            style={{width:'48%',backgroundColor:'#23a2a4',padding:10,borderRadius:10}}
            onPress={handleDownloadInvoice}
          >
            <Text style={{color:'#fff',textAlign:'center'}}>{t('download_invoice')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{width:'48%',backgroundColor:'#23a2a4',padding:10,borderRadius:10}}
            onPress={handleTrackOrder}
          >
            <Text style={{color:'#fff',textAlign:'center'}}>{t('track_order')}</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  gifContainer: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLottie: {
    width: 150,
    height: 150,
  },
});

export default OrderSuccess