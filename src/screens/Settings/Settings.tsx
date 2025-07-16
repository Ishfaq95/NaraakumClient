import Header from "../../components/common/Header";
import { useTranslation } from "react-i18next";
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import CustomBottomSheet from "../../components/common/CustomBottomSheet";
import { useEffect, useState } from "react";
import Dropdown from "../../components/common/Dropdown";
import { globalTextStyles } from "../../styles/globalStyles";


const menuItems = [
  { label: 'إعداد التذكير', icon: <Feather name="settings" size={20} color="#239EA0" />, key: 'reminderSetting' },
];

const ReminderTimeUnit = [
  { label: 'الدقائق', value: 'minute' },
  { label: 'الساعات', value: 'hour' },
  { label: 'الأيام', value: 'day' },
];

const ReminderMinutes = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '15', value: '15' },
  { label: '30', value: '30' },
  { label: '45', value: '45' },
];

const ReminderHours = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
];



const SettingsScreen = () => {
  const { t } = useTranslation();
  const [reminderSettingBottomSheetVisible, setReminderSettingBottomSheetVisible] = useState(false);
  const [reminderTimeUnit, setReminderTimeUnit] = useState<any>('');
  const [reminderMinutesAndHours, setReminderMinutesAndHours] = useState<any>('5');

  useEffect(() => {
    setReminderMinutesAndHours(reminderTimeUnit == 'minute' ? '5' : '1');
  }, [reminderTimeUnit]);

  useEffect(() => {
    setReminderTimeUnit('minute');
    setReminderMinutesAndHours('5');
  }, []);

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      }
    />
  );

  const settingItemsClick = (item: any) => {
    const keys = item.key;
    switch (keys) {
      case 'reminderSetting':
        setReminderSettingBottomSheetVisible(true);
        break;
      default:
        break;
    }
  }

  const renderItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.row} onPress={() => {
      settingItemsClick(item);
    }}>
      <Icon name="chevron-left" size={22} color="#239EA0" style={styles.leftArrow} />
      <Text style={styles.label}>{item.label}</Text>
      <View style={styles.iconBox}>{item.icon}</View>
    </TouchableOpacity>
  );

  const onPressSaveReminderSetting = () => {
    setReminderSettingBottomSheetVisible(false);
  }

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

      <CustomBottomSheet
        visible={reminderSettingBottomSheetVisible}
        onClose={() => setReminderSettingBottomSheetVisible(false)}
        height="30%"
      >
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ ...globalTextStyles.bodyMedium, fontFamily: globalTextStyles.h5.fontFamily, color: '#000' }}>إعدادات التذكيرات</Text>
            <TouchableOpacity onPress={() => setReminderSettingBottomSheetVisible(false)}>
              <Icon name="close" size={20} color="#239EA0" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <View style={{ width: '48%' }}>
              <Dropdown data={ReminderTimeUnit} containerStyle={{ height: 50 }} dropdownStyle={{ height: 50 }} value={reminderTimeUnit} onChange={(item: any) => {setReminderTimeUnit(item.value)}} />
            </View>
            <View style={{ width: '48%' }}>
              <Dropdown
                data={reminderTimeUnit === 'minute' ? ReminderMinutes : ReminderHours}
                placeholder={reminderTimeUnit === 'minute' ? '5' : '1'}
                value={reminderMinutesAndHours}
                onChange={(item: any) => setReminderMinutesAndHours(item.value)}
                containerStyle={{ height: 50 }} dropdownStyle={{ height: 50 }}
              />
            </View>
          </View>

          <TouchableOpacity onPress={onPressSaveReminderSetting} style={{ backgroundColor: '#239EA0', padding: 10, borderRadius: 10, marginTop: 10 }}>
            <Text style={{ ...globalTextStyles.buttonMedium, color: '#fff', textAlign: 'center' }}>حفظ</Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    ...globalTextStyles.h3,
    color: '#239EA0',
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
});

export default SettingsScreen;