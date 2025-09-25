import Header from "../../components/common/Header";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, FlatList,SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import CustomBottomSheet from "../../components/common/CustomBottomSheet";
import { useEffect, useRef, useState } from "react";
import Dropdown from "../../components/common/Dropdown";
import { globalTextStyles } from "../../styles/globalStyles";
import { settingService } from "../../services/api/settingService";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Animated, Easing } from "react-native";

// Lightweight shimmer placeholder for inline text/value
const ShimmerPlaceholder = ({ width = 120, height = 14, borderRadius = 6 }: { width?: number; height?: number; borderRadius?: number; }) => {
  const translateX = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: width,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -width,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    loopAnimation.start();
    return () => {
      loopAnimation.stop();
    };
  }, [translateX, width]);

  return (
    <View style={{ width, height, borderRadius, overflow: 'hidden', backgroundColor: '#E6E6E6', marginLeft: 6 }}>
      <Animated.View style={{
        width: '40%',
        height: '100%',
        transform: [{ translateX }],
      }}>
        <LinearGradient
          colors={["#E6E6E6", "#F5F5F5", "#E6E6E6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
};

const menuItems = [
  { label: 'إعداد التذكير', icon: <Ionicons name="alarm" size={20} color="#239EA0" />, key: 'reminderSetting' },
];

const ReminderTimeUnit = [
  { label: 'الدقائق', value: '6' },
  { label: 'الساعات', value: '5' },
  { label: 'الأيام', value: '1' },
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

const ReminderDays = [
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
  const [reminderTimeUnit, setReminderTimeUnit] = useState<string>('6'); // Default to minutes
  const [reminderMinutesAndHours, setReminderMinutesAndHours] = useState<string>('5'); // Default value
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false); // Track if API data is loaded
  const user = useSelector((state: any) => state.root.user.user);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const updateReminderSettingApi = async () => {
    try {
      const payload = {
        "UserloginInfoId": user.Id,
        "CatTimeUnitId": reminderTimeUnit,
        "TimeUnitDuration": reminderMinutesAndHours
      }

      const response = await settingService.updateReminderSetting(payload);
      if (response.ResponseStatus.STATUSCODE == 200) {
      }
    } catch (error) {
    } finally {
      setIsDataLoaded(true);
    }
  }

  const getReminderTimeUnitLabel = () => {
    switch (reminderTimeUnit) {
      case '6':
        return 'الدقائق';
      case '5':
        return 'الساعات';
      case '1':
        return 'الأيام';
      default:
        return 'الدقائق';
    }
  }

  useEffect(() => {
    if (isFocused) {
      getReminderSettingApi()
    }
  }, [isFocused]);

  const getReminderSettingApi = async () => {
    try {
      setLoading(true);
      const payload = {
        "UserloginInfoId": user.Id,
      }
      const response = await settingService.getReminderSetting(payload);

      if (response.ResponseStatus.STATUSCODE == 200 && response.ReminderSetting && response.ReminderSetting.length > 0) {
        const reminderValues = response.ReminderSetting[0];

        // Set values from API
        setReminderTimeUnit(reminderValues.CatTimeUnitId.toString());
        setReminderMinutesAndHours(reminderValues.TimeUnitDuration.toString());
        setIsDataLoaded(true);
      } else {
        // No API data, use defaults
        setDefaultValues();
        setIsDataLoaded(true);
      }
    } catch (error) {
      // API failed, use defaults
      setDefaultValues();
      setIsDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  const setDefaultValues = () => {
    setReminderTimeUnit('6'); // Default to minutes
    setReminderMinutesAndHours('5'); // Default to 5 minutes
  }

  // Get the appropriate data array based on selected time unit
  const getTimeData = (timeUnit: string) => {
    switch (timeUnit) {
      case '6': // Minutes
        return ReminderMinutes;
      case '5': // Hours
        return ReminderHours;
      case '1': // Days
        return ReminderDays;
      default:
        return ReminderMinutes;
    }
  };

  // Get default value based on selected time unit
  const getDefaultValue = (timeUnit: string) => {
    switch (timeUnit) {
      case '6': // Minutes
        return '5';
      case '5': // Hours
        return '1';
      case '1': // Days
        return '1';
      default:
        return '5';
    }
  };

  // Update the second dropdown when time unit changes (only if data is loaded and user manually changes)
  useEffect(() => {
    if (isDataLoaded) {
      // Only update if the current value doesn't exist in the new data array
      const currentData = getTimeData(reminderTimeUnit);
      const valueExists = currentData.some(item => item.value === reminderMinutesAndHours);

      if (!valueExists) {
        const defaultValue = getDefaultValue(reminderTimeUnit);
        setReminderMinutesAndHours(defaultValue);
      }
    }
  }, [reminderTimeUnit, isDataLoaded]);

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
      {item.key == 'reminderSetting' ? (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.label}>ذكرني قبل الموعد بـ </Text>
          {loading ? (
            <ShimmerPlaceholder width={50} height={16} borderRadius={4} />
          ) : (
            <Text style={{ fontFamily: globalTextStyles.h2.fontFamily, color: '#000' }}>
              {reminderMinutesAndHours} {getReminderTimeUnitLabel()}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.label}>{item.label}</Text>
      )}
      <View style={styles.iconBox}>{item.icon}</View>
    </TouchableOpacity>
  );

  const onPressSaveReminderSetting = () => {
    updateReminderSettingApi();
    setReminderSettingBottomSheetVisible(false);
  }

  const onPressChangeReminderTimeUnit = (value: string | number) => {
    setReminderTimeUnit(value as string);
  }

  const onPressChangeReminderValue = (value: string | number) => {
    setReminderMinutesAndHours(value as string);
  }

  // Get current time data
  const currentTimeData = getTimeData(reminderTimeUnit);

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
        height="32%"
        showHandle={false}
        style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: 'hidden' }}
      >
        <View style={{ flex: 1, backgroundColor: '#fff'}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',backgroundColor:'#E6F3F3',paddingVertical:10,paddingHorizontal:16,borderTopLeftRadius:10,borderTopRightRadius:10 }}>
            <Text style={{ ...globalTextStyles.bodyMedium, fontFamily: globalTextStyles.h5.fontFamily, color: '#000' }}>إعدادات التذكيرات</Text>
            <TouchableOpacity onPress={() => setReminderSettingBottomSheetVisible(false)}>
              <Icon name="close" size={20} color="#239EA0" />
            </TouchableOpacity>
          </View>
          <Text style={{ ...globalTextStyles.bodySmall, fontFamily: globalTextStyles.h5.fontFamily, color: '#666',paddingHorizontal:16,marginTop:10 }}>تذكيري قبل </Text>
          <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 10,paddingHorizontal:16 }}>
            <View style={{ width: '48%' }}>
              <Dropdown
                data={currentTimeData}
                placeholder={getDefaultValue(reminderTimeUnit)}
                value={reminderMinutesAndHours}
                onChange={(value: string | number) => onPressChangeReminderValue(value)}
                containerStyle={{ height: 50 }}
                dropdownStyle={{ height: 50 }}
              />
            </View>
            <View style={{ width: '48%' }}>
              <Dropdown
                data={ReminderTimeUnit}
                containerStyle={{ height: 50 }}
                dropdownStyle={{ height: 50 }}
                value={reminderTimeUnit}
                onChange={(value: string | number) => onPressChangeReminderTimeUnit(value)}
              />
            </View>

          </View>

          <TouchableOpacity onPress={onPressSaveReminderSetting} style={{ backgroundColor: '#239EA0', padding: 10, borderRadius: 10, marginTop: 10,marginHorizontal:16 }}>
            <Text style={{ ...globalTextStyles.buttonMedium, color: '#fff', textAlign: 'center' }}>يحفظ</Text>
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
    ...globalTextStyles.h4,
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
    // flex: 1,
    ...globalTextStyles.bodyMedium,
    color: '#666',
    textAlign: 'left',
    fontFamily: globalTextStyles.h5.fontFamily,
    marginLeft: 8,
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