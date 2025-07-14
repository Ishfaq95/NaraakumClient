import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import FullScreenLoader from '../../components/FullScreenLoader';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import ReservationReceivedItemRender from './profileComponents/ReservationReceivedItemRender';

const ReservationReceivedScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [cpAddedOrders, setCpAddedOrders] = useState([]);
  const user = useSelector((state: RootState) => state.root.user.user);

  useEffect(() => {
    getCpAddedOrders();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, marginTop: 10, alignItems: 'center', }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: "center", color: '#000' }}>الحجوزات المستلمة من مقدمي الخدمات</Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: '#000' }}>يمكن لمقدم الخدمة أن يرسل إليك مجموعة من الخدمات في أثناء الزيارة. عليك فقط إتمام الحجز!</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: '#e4f1ef', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'flex-start', }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10 }}>{`النتائج : (${cpAddedOrders.length})`}</Text>
        <View style={styles.contentContainer}>

          <FlatList
            data={cpAddedOrders}
            renderItem={({ item }: any) => <ReservationReceivedItemRender item={item} />}
            keyExtractor={(item) => getUniqueId()}
            style={{ width: '100%', }}
            ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>{t('no_addresses')}</Text>
            </View>}
          />
        </View>
      </View>
      <FullScreenLoader visible={isLoading} />
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
})

export default ReservationReceivedScreen