import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native'
import Header from '../../components/common/Header';
import React, { useState } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import WebSocketService from '../../components/WebSocketService';
import CurrentVisitAppointments from './profileComponents/currentVisitAppointments';
import PreviousVisitAppointments from './profileComponents/previousVisitAppointments';
import CancelledVisitAppointments from './profileComponents/cancelledVisitAppointments';

const VisitOrderListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.root.user.user);
  const { topic } = useSelector((state: any) => state.root.user);
  const webSocketService = WebSocketService.getInstance();
  const isFocused = useIsFocused();

  console.log(user);

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('visit_order_list')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const routes = [
    { key: 'current', title: t('current') },
    { key: 'previous', title: t('previous') },
    { key: 'cancelled', title: t('cancelled') },
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

  const renderScene = SceneMap({
    current: () => <CurrentVisitAppointments userId={user.Id} />,
    previous: () => <PreviousVisitAppointments userId={user.Id} />,
    cancelled: () => <CancelledVisitAppointments userId={user.Id} />,
  });

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
        lazyPreloadDistance={0}
        tabBarPosition="top"
        style={styles.tabView}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  tabView: {
    flex: 1,
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
})

export default VisitOrderListScreen