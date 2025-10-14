import React, { useEffect } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'
import LottieAnimation from '../common/LottieAnimation'
import { LOTTIE_ANIMATIONS } from '../../assets/animation'
import { generateAndDownloadInvoice } from '../../services/InvoiceService'
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import moment from 'moment';
import { globalTextStyles } from '../../styles/globalStyles';
import { scheduleNotificationAndroid, scheduleNotificationIOS } from '../../shared/services/service'
import { notificationService } from '../../services/api/NotificationService'
import { useSelector } from 'react-redux';
import { useAlert } from '../../contexts/AlertContext';

const OrderSuccess = ({ navigation, route }: any) => {
  const OrderDetail = route?.params?.SuccessResponse;
  const user = useSelector((state: any) => state.root.user.user);
  const { t } = useTranslation();
  const { showAlert } = useAlert();

  useEffect(() => {
    setUpNotification();
  }, []);

  const setUpNotification = async () => {
    try {
      notificationService.getSystemNotification({
        UserloginInfo: user.Id,
      }).then((SystemNotificationList: any) => {
        if (Platform.OS === 'ios') {
          scheduleNotificationIOS(SystemNotificationList?.ReminderList);
        } else {
          scheduleNotificationAndroid(SystemNotificationList?.ReminderList);
        }
      });
    } catch (error) {
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      if (OrderDetail) {
        const invoiceData = OrderDetail;

        // Generate and download the invoice
         await generateAndDownloadInvoice(invoiceData);

         if(Platform.OS === 'ios'){
          
         }else{
          
        // // Show success message
        showAlert({
          title: 'تم التحميل بنجاح',
          message: 'تم حفظ الفاتورة في مجلد المستندات',
          type: 'success',
          confirmText: 'حسناً',
          onConfirm: () => {
            navigation.navigate(ROUTES.AppNavigator, {
              screen: ROUTES.HomeStack,
              params: {
                screen: ROUTES.AppointmentListScreen,
              }
            });
          }
        });
         }
        
        
      } else {
        showAlert({
          title: 'خطأ',
          message: 'لا توجد بيانات الفاتورة متاحة',
          type: 'error',
          confirmText: 'حسناً',
        });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      showAlert({
        title: 'خطأ',
        message: 'حدث خطأ أثناء إنشاء الفاتورة',
        type: 'error',
        confirmText: 'حسناً',
      });
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
        <View style={styles.gifContainer}>
          <LottieAnimation
            source={LOTTIE_ANIMATIONS.ORDER_SUCCESS}
            style={styles.successLottie}
            autoPlay
            loop
          />
        </View>
        <View style={{ alignItems:"center",justifyContent:"center",marginBottom:15}}>
          <Text style={globalTextStyles.h3}>{t('booking_successful')}</Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={[globalTextStyles.buttonMedium, { color: "#23a2a4" }]}>{t('transaction_status')}</Text>
          <Text style={[globalTextStyles.bodySmall, { fontWeight: "600", color: "#23a2a4" }]}>{t('تمت العملية بنجاح')}</Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={[globalTextStyles.buttonMedium, { color: "#23a2a4" }]}>{t('transaction_number')}</Text>
          <Text style={[globalTextStyles.bodySmall, { fontWeight: "600", color: "#23a2a4" }]}>
            {OrderDetail[0].OrderID ? `NAR-${OrderDetail[0].OrderID}` : 'N/A'}
          </Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={[globalTextStyles.buttonMedium, {  color: "#23a2a4" }]}>{t('transaction_date')}</Text>
          <Text style={[globalTextStyles.bodySmall, { fontWeight: "600", color: "#23a2a4" }]}>
            {OrderDetail[0].OrderDate ? moment(OrderDetail[0].OrderDate).locale('en').format('DD/MM/YYYY') : moment().locale('en').format('DD/MM/YYYY')}
          </Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={[globalTextStyles.buttonMedium, {  color: "#23a2a4" }]}>{t('transaction_amount')}</Text>
          <Text style={[globalTextStyles.bodySmall, { fontWeight: "600", color: "#23a2a4" }]}>
            {`${ OrderDetail.length > 0 ? OrderDetail.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0) : 0} SAR` }
          </Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8,paddingTop:30 }}>
          <TouchableOpacity 
            style={{width:'48%',backgroundColor:'#23a2a4',padding:10,borderRadius:10}}
            onPress={handleDownloadInvoice}
          >
            <Text style={[globalTextStyles.buttonMedium, { color: '#fff', textAlign: 'center' }]}>{t('download_invoice')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{width:'48%',backgroundColor:'#23a2a4',padding:10,borderRadius:10}}
            onPress={handleTrackOrder}
          >
            <Text style={[globalTextStyles.buttonMedium, { color: '#fff', textAlign: 'center' }]}>{t('track_order')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerTitle: {
    ...globalTextStyles.h3,
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