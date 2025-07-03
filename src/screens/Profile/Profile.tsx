import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import Header from '../../components/common/Header';

const walletBalance = 12475799.0; // Mocked value

const menuItems = [
  { label: 'حسابي', icon: <Icon name="person" size={20} color="#239EA0" />, key: 'account' },
  { label: 'طلباتي', icon: <FontAwesome name="clipboard-list" size={18} color="#239EA0" />, key: 'orders' },
  { label: 'مواعيدي للاستشارات عن بعد', icon: <FontAwesome name="calendar-alt" size={18} color="#239EA0" />, key: 'appointments' },
  { label: 'سجل الزيارات / الاستشارات', icon: <FontAwesome name="file-alt" size={18} color="#239EA0" />, key: 'history' },
  { label: 'الحجوزات المستلمة', icon: <FontAwesome name="stethoscope" size={18} color="#239EA0" />, key: 'received' },
  { label: 'تقييماتي', icon: <FontAwesome name="star" size={18} color="#239EA0" />, key: 'reviews' },
  { label: 'رصيد محفظتي', icon: <FontAwesome name="wallet" size={18} color="#239EA0" />, key: 'wallet', isWallet: true },
  { label: 'عناويني', icon: <Ionicons name="location-outline" size={20} color="#239EA0" />, key: 'addresses' },
  { label: 'المستفيدون', icon: <FontAwesome name="users" size={18} color="#239EA0" />, key: 'beneficiaries' },
  { label: 'مفضلتي', icon: <FontAwesome name="heart" size={18} color="#239EA0" />, key: 'favorites' },
  { label: 'حذف الحساب', icon: <Feather name="trash-2" size={18} color="#239EA0" />, key: 'delete' },
  { label: 'تسجيل الخروج', icon: <Entypo name="log-out" size={20} color="#239EA0" />, key: 'logout' },
];

const ProfileScreen = () => {
  const { t } = useTranslation();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.row}>
      {/* Left arrow */}
      <Icon name="chevron-left" size={22} color="#239EA0" style={styles.leftArrow} />
      {item.isWallet && <View style={styles.walletPill}>
          <Text style={styles.walletText}>SAR {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>}
      {/* Label */}
      <Text style={styles.label}>{item.label}</Text>
      {/* Wallet pill or icon */}
      {/* {item.isWallet ? (
        <View style={styles.walletPill}>
          <Text style={styles.walletText}>SAR {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
      ) : ( */}
        <View style={styles.iconBox}>{item.icon}</View>
      {/* )} */}
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
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
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
    fontSize: 16,
    color: '#222',
    textAlign: 'left',
    fontWeight: '500',
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ProfileScreen;