import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { logout } from '../shared/redux/reducers/userReducer';
import { useDispatch } from 'react-redux';

type TabType = 'current' | 'upcoming' | 'previous';

const AppointmentListScreen = ({navigation}: any) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const layout = useWindowDimensions();
  const dispatch = useDispatch();

  const onLogout = () => {
    dispatch(logout());
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft} >
        <TouchableOpacity style={styles.logoutButton} onPress={() => onLogout()}>
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>{t('appointments')}</Text>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>{t('book_order')}</Text>
      </TouchableOpacity>
    </View>
  );

  const CurrentTab = () => (
    <View style={styles.contentContainer}>
      <Text>{t('current_appointments')}</Text>
    </View>
  );

  const UpcomingTab = () => (
    <View style={styles.contentContainer}>
      <Text>{t('upcoming_appointments')}</Text>
    </View>
  );

  const PreviousTab = () => (
    <View style={styles.contentContainer}>
      <Text>{t('previous_appointments')}</Text>
    </View>
  );

  const renderScene = SceneMap({
    current: CurrentTab,
    upcoming: UpcomingTab,
    previous: PreviousTab,
  });

  const routes = isRTL 
    ? [
        { key: 'current', title: t('current') },
        { key: 'upcoming', title: t('upcoming') },
        { key: 'previous', title: t('previous') },
      ]
    : [
        { key: 'current', title: t('current') },
        { key: 'upcoming', title: t('upcoming') },
        { key: 'previous', title: t('previous') },
      ];

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#008080"
      inactiveColor="#666666"
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={true}
        animationEnabled={true}
        lazy={true}
        tabBarPosition="top"
        style={styles.tabView}
        direction={isRTL ? 'rtl' : 'ltr'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    width: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: 80,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: 80,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
  indicator: {
    backgroundColor: '#008080',
    height: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  tabView: {
    flex: 1,
  },
});

export default AppointmentListScreen; 