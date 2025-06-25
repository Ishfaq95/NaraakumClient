import React from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import FastImage from 'react-native-fast-image'
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';

const OrderSuccess = ({ navigation, SuccessResponse }: any) => {

  const { t } = useTranslation();

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('order_success')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{flex:1,paddingHorizontal:16,alignItems:"center",justifyContent:"center" }}>
        <View style={styles.gifContainer}>
          <Image 
            source={require('../../assets/images/NaraakumLogo.png')}
            style={styles.successGif}
            resizeMode="contain"
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
          <Text style={{fontSize:14,fontWeight:"600",color:"#23a2a4"}}>{t('تمت العملية بنجاح')}</Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={{fontSize:16,fontWeight:'bold',color:"#23a2a4"}}>{t('transaction_date')}</Text>
          <Text style={{fontSize:14,fontWeight:"600",color:"#23a2a4"}}>{t('تمت العملية بنجاح')}</Text>
        </View>
        <View style={{width:'100%', flexDirection:'row', alignItems: "center", justifyContent: 'space-between',paddingBottom:8 }}>
          <Text style={{fontSize:16,fontWeight:'bold',color:"#23a2a4"}}>{t('transaction_amount')}</Text>
          <Text style={{fontSize:14,fontWeight:"600",color:"#23a2a4"}}>{t('تمت العملية بنجاح')}</Text>
        </View>
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  successGif: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

export default OrderSuccess