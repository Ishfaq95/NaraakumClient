import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import Header from '../../components/common/Header';
import { ROUTES } from '../../shared/utils/routes';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { setTopic, setUser } from '../../shared/redux/reducers/userReducer';
import WebSocketService from '../../components/WebSocketService';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { bookingService } from '../../services/api/BookingService';
import { RootState } from '../../shared/redux/store';
import { globalTextStyles } from '../../styles/globalStyles';
import { profileService } from '../../services/api/ProfileService';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { label: 'حسابي', icon: <Icon name="person" size={20} color="#239EA0" />, key: 'account', route: ROUTES.updateProfile },
  { label: 'طلباتي', icon: <FontAwesome name="clipboard-list" size={18} color="#239EA0" />, key: 'orders', route: ROUTES.visitOrderList },
  { label: 'مواعيدي للاستشارات عن بعد', icon: <FontAwesome name="calendar-alt" size={18} color="#239EA0" />, key: 'appointments', route: ROUTES.remoteOrderList },
  { label: 'سجل الزيارات / الاستشارات', icon: <FontAwesome name="file-alt" size={18} color="#239EA0" />, key: 'history', route: ROUTES.visit_consultant_log },
  { label: 'الحجوزات المستلمة', icon: <FontAwesome name="stethoscope" size={18} color="#239EA0" />, key: 'received', route: ROUTES.reservationReceived },
  { label: 'تقييماتي', icon: <FontAwesome name="star" size={18} color="#239EA0" />, key: 'reviews', route: ROUTES.myRating },
  { label: 'رصيد محفظتي', icon: <FontAwesome name="wallet" size={18} color="#239EA0" />, key: 'wallet', isWallet: true, route: ROUTES.walletBalance },
  { label: 'عناويني', icon: <Ionicons name="location-outline" size={20} color="#239EA0" />, key: 'addresses', route: ROUTES.myAddresses },
  { label: 'المستفيدون', icon: <FontAwesome name="users" size={18} color="#239EA0" />, key: 'beneficiaries', route: ROUTES.beneficiaries },
  { label: 'مفضلتي', icon: <FontAwesome name="heart" size={18} color="#239EA0" />, key: 'favorites', route: ROUTES.favorites },
  { label: 'حذف الحساب', icon: <Feather name="trash-2" size={18} color="#239EA0" />, key: 'delete', route: ROUTES.delete },
  { label: 'تسجيل الخروج', icon: <Entypo name="log-out" size={20} color="#239EA0" />, key: 'logout' },
];

const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const webSocketService = WebSocketService.getInstance();
  const [walletBalance, setWalletBalance] = useState(0);
  const user = useSelector((state: RootState) => state.root.user.user);
  const [cpAddedOrdersCount, setCpAddedOrdersCount] = useState(0);
  const isFocused = useIsFocused();

  const onLogout = () => {
    dispatch(setTopic(null));
    webSocketService.disconnect();
    dispatch(setUser(null));
  };

  const getCpAddedOrders = async () => {
    try {
      const payload = {
        "UserloginInfoId": user?.Id,
      }
      const response = await profileService.getCpAddedOrders(payload);
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        const CpAddedOrders = response?.UserOrders?.filter((item: any) => item?.CatOrderStatusId == '22');
        setCpAddedOrdersCount(CpAddedOrders?.length);
        }
    } catch (error) {
    }
  }

  useEffect(() => {
    getWalletBalance();
    getCpAddedOrders();
  }, [isFocused]);

  const getWalletBalance = async () => {
    const payload = {
      "UserLoginInfoId": user?.Id,
    }
    const response = await bookingService.getUpdatedWallet(payload);
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setWalletBalance(response?.Wallet[0]?.TotalAmount || 0);
    }
  }

  const renderItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.row} onPress={() => {
      if (item.key === 'logout') {
        onLogout();
      } else {
        navigation.navigate(item.route as never);
      }
    }}>
      <Icon name="chevron-left" size={22} color="#239EA0" style={styles.leftArrow} />
      {item.isWallet && <View style={styles.walletPill}>
        <Text style={styles.walletText}>SAR {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
      </View>}
      {(item.key == 'received' && cpAddedOrdersCount > 0) && <View style={styles.reservationPill}>
        <Text style={styles.reservationCount}>{cpAddedOrdersCount}</Text>
      </View>}
      <Text style={styles.label}>{item.label}</Text>
      <View style={styles.iconBox}>{item.icon}</View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    ...globalTextStyles.h4,
    color: '#000',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  leftArrow: {
    marginLeft: 0,
    marginRight: 12,
  },
  label: {
    flex: 1,
    ...globalTextStyles.bodyMedium,
    color: '#222',
    textAlign: 'left',
    fontFamily: globalTextStyles.h5.fontFamily,
    marginLeft: 12,
  },
  iconBox: {
    backgroundColor: '#E6F3F3',
    borderRadius: 8,
    padding: 8,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletPill: {
    backgroundColor: '#23A2A4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletText: {
    ...globalTextStyles.bodySmall,
    color: '#fff',
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  reservationPill: {
    backgroundColor: '#23A2A4',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 0,
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationCount: {
    ...globalTextStyles.bodySmall,
    color: '#fff',
    fontFamily: globalTextStyles.h6.fontFamily,
  }
});

export default ProfileScreen;