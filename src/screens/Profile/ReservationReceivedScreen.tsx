import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ScrollView, ActivityIndicator } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import FullScreenLoader from '../../components/FullScreenLoader';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import ReservationReceivedItemRender from './profileComponents/ReservationReceivedItemRender';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ReservationReceivedScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [cpAddedOrders, setCpAddedOrders] = useState([]);
  const [orderDetailsByServiceProvider, setOrderDetailsByServiceProvider] = useState<any>();
  const user = useSelector((state: RootState) => state.root.user.user);
  const [openBottomSheetCompleteOrder, setOpenBottomSheetCompleteOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>({});
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);

  useEffect(() => {
    getCpAddedOrders();
  }, []);

  console.log("selectedOrder===>", selectedOrder);

  const getOrderDetailsAddedByServiceProvider = async (item: any) => {
    try {
      setIsLoadingOrderDetails(true);
      setOrderDetailsByServiceProvider({});
      const payload = {
        "OrderId": item?.OrderID,
        "UserLoginInfoId": item?.OrderBycareProviderID
      }
      const response = await profileService.getOrderDetailsAddedByServiceProvider(payload);
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        setOrderDetailsByServiceProvider(response?.UserOrders[0]);
      }
    } catch (error) {
      console.log("error===>", error);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  }

  const getCpAddedOrders = async () => {
    try {
      setIsLoading(true);
      const payload = {
        "UserloginInfoId": user?.Id,
      }
      const response = await profileService.getCpAddedOrders(payload);
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        setCpAddedOrders(response?.UserOrders);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('update_profile')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const getUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  const handleClickOrderDetails = useCallback((item: any) => {
    setSelectedOrder(item);
    getOrderDetailsAddedByServiceProvider(item);
    setOpenBottomSheetCompleteOrder(true);
  }, []);

  const renderItem = useCallback(({ item }: any) => (
    <ReservationReceivedItemRender 
      item={item} 
      onClickOrderDetails={handleClickOrderDetails} 
      getUpdatedOrders={getCpAddedOrders}
    />
  ), [handleClickOrderDetails]);

  const handleClickPayAndPay = () => {
    navigation.navigate(ROUTES.AppNavigator, {
      screen: ROUTES.HomeStack,
      params: {
        screen: ROUTES.BookingScreen,
        params: {
          currentStep: 3,
        }
      }
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, marginTop: 10, alignItems: 'center', }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', textAlign: "center", color: '#000' }]}>الحجوزات المستلمة من مقدمي الخدمات</Text>
        <Text style={[globalTextStyles.caption, { textAlign: 'center', color: '#000' }]}>يمكن لمقدم الخدمة أن يرسل إليك مجموعة من الخدمات في أثناء الزيارة. عليك فقط إتمام الحجز!</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: '#e4f1ef', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'flex-start', }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', marginBottom: 10 }]}>{`النتائج : (${cpAddedOrders.length})`}</Text>
        <View style={styles.contentContainer}>

          <FlatList
            data={cpAddedOrders}
            renderItem={renderItem}
            keyExtractor={(item: any) => item?.OrderID?.toString() || Math.random().toString()}
            style={{ width: '100%', }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            getItemLayout={(data, index) => ({
              length: 200, // Approximate height of each item
              offset: 200 * index,
              index,
            })}
            ListEmptyComponent={useMemo(() => () => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000' }]}>{t('no_addresses')}</Text>
              </View>
            ), [t])}
          />
        </View>
      </View>
      <FullScreenLoader visible={isLoading} />

      <CustomBottomSheet
        visible={openBottomSheetCompleteOrder}
        onClose={() => setOpenBottomSheetCompleteOrder(false)}
        height={'80%'}
        backdropClickable={false}
        showHandle={false} >
        {isLoadingOrderDetails ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <ActivityIndicator size="large" color="#000" />
        </View> :
          <>
            <View style={{ backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
              <View style={{ height: 50, width: '100%', backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
                <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>معلومات الحجز</Text>
                <TouchableOpacity onPress={() => setOpenBottomSheetCompleteOrder(false)}>
                  <AntDesign name="close" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={{ flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, }}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsHeaderText}>الخدمات المختارة (1)</Text>
                </View>
                {orderDetailsByServiceProvider?.OrderDetail?.map((item: any) => (
                  <>

                    <View style={styles.selectedServiceRow}>
                      {item?.CatCategoryId == "42"
                        ? <Text style={styles.selectedServiceText}>{`استشارة عن بعد / ${String(item?.ServiceTitleSlang || item?.TitleSlang || '')}`}</Text>
                        : <Text style={styles.selectedServiceText}>{String(item?.ServiceTitleSlang || item?.TitleSlang || '')}</Text>
                      }
                      <View style={styles.selectedServiceCircle}><Text style={styles.selectedServiceCircleText}>1</Text></View>
                    </View>

                  </>
                ))}
                {/* Patient Information */}
                <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                  <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>معلومات المستفيد (المريض)</Text>

                  </View>
                  <View style={{ paddingTop: 5, width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الأسم</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{orderDetailsByServiceProvider?.OrderDetail[0]?.FullNameSlang}</Text>
                  </View>
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>صلة القرابة</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{orderDetailsByServiceProvider?.OrderDetail[0]?.RelationSLang}</Text>
                  </View>
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الاقامة</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{orderDetailsByServiceProvider?.OrderDetail[0]?.CatNationalityId == 213 ? 'مواطن' : 'مقيم'}</Text>
                  </View>
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>رقم الهوية</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{orderDetailsByServiceProvider?.OrderDetail[0]?.IDNumber}</Text>
                  </View>
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>العمر</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{orderDetailsByServiceProvider?.OrderDetail[0]?.Age}</Text>
                  </View>
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الجنس</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{orderDetailsByServiceProvider?.OrderDetail[0]?.Gender == 1 ? 'ذكر' : 'أنثى'}</Text>
                  </View>
                </View>
                {/* payment Information */}
                <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                  <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>معلومات الدفع</Text>
                  </View>
                  <View style={{ paddingTop: 5, width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>اجمالى الخدمات</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{`SAR ${orderDetailsByServiceProvider?.OrderDetail?.reduce((acc: any, item: any) => acc + item.PriceBySP, 0)?.toFixed(2)}`}</Text>
                  </View>
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الضريبة (15%)</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{`SAR ${orderDetailsByServiceProvider?.OrderDetail?.reduce((acc: any, item: any) => acc + item.TaxAmt, 0)?.toFixed(2)}`}</Text>
                  </View>
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>المجموع</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{`SAR ${orderDetailsByServiceProvider?.OrderDetail?.reduce((acc: any, item: any) => acc + item.PriceCharged, 0)?.toFixed(2)}`}</Text>
                  </View>

                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginTop: 20, paddingHorizontal: 10, }}>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>اجمالى الفاتورة</Text>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{`SAR ${orderDetailsByServiceProvider?.OrderDetail?.reduce((acc: any, item: any) => acc + item.PriceCharged, 0)?.toFixed(2)}`}</Text>
                  </View>
                </View>
                <TouchableOpacity disabled={selectedOrder?.CatOrderStatusId != 22} onPress={handleClickPayAndPay} style={[{ width: '94%', marginHorizontal: 10, height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 }, selectedOrder?.CatOrderStatusId != 22 && { backgroundColor: '#ccc' }]}>
                  <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>الدفع والسداد</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </>
        }

      </CustomBottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    width: '100%',
  },
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
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#e4f1ef',
    paddingVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  detailsHeaderText: {
    ...globalTextStyles.bodyMedium,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#333',
  },
  selectedServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectedServiceCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#23a2a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedServiceCircleText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  selectedServiceText: {
    ...globalTextStyles.bodyMedium,
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
})

export default ReservationReceivedScreen