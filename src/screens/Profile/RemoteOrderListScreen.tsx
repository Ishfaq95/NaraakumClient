import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native'
import Header from '../../components/common/Header';
import React, { useState } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import WebSocketService from '../../components/WebSocketService';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { TabBar, SceneMap, TabView } from 'react-native-tab-view';
import UpcomingAppointments from '../../components/appointments/UpcomingAppointments';
import CurrentAppointments from '../../components/appointments/CurrentAppointments';
import PreviousAppointments from '../../components/appointments/PreviousAppointments';

const RemoteOrderListScreen = () => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.root.user.user);
  const {topic} = useSelector((state: any) => state.root.user);
  const webSocketService = WebSocketService.getInstance();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

    const handleBack = () => {
        navigation.goBack();
      };

      const handleJoinMeeting = (appointment: any) => {

        // Parse the date and time separately
        const date = moment.utc(appointment.SchedulingDate);
        const [startHours, startMinutes] = appointment.SchedulingTime.split(':');
        const [endHours, endMinutes] = appointment.SchedulingEndTime.split(':');
    
        // Create UTC moments with the correct time
        let startTimeUTC = moment.utc(date).set({
          hours: parseInt(startHours),
          minutes: parseInt(startMinutes)
        });
        
        let endDateTimeUTC = moment.utc(date).set({
          hours: parseInt(endHours),
          minutes: parseInt(endMinutes)
        });
    
        // Convert to local time
        let startTimeLocal = startTimeUTC.local();
        let endTimeLocal = endDateTimeUTC.local();
    
        let meetingInfo = {
          toUserId: appointment.ServiceProviderId,
          sessionStartTime: startTimeLocal.toISOString(),
          bookingId: appointment.TaskId,
          patientProfileId: appointment.PatientUserProfileInfoId,
          meetingId: appointment.VideoSDKMeetingId,
          Name: appointment.ServiceProviderSName,
          displayName: appointment.PatientSName,
          sessionEndTime: endTimeLocal.toISOString(),
          patientId: appointment.UserLoginInfoId,
          serviceProviderId: appointment.ServiceProviderId
        }; 
        
        navigation.navigate(ROUTES.preViewCall, {Data: meetingInfo});
      };
    
      const renderHeader = () => (
        <Header
          centerComponent={
            <Text style={styles.headerTitle}>{t('remote_orders')}</Text>
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
    
      const renderScene = SceneMap({
        current: () => <CurrentAppointments userId={user?.Id} onJoinMeeting={handleJoinMeeting} />,
        upcoming: () => <UpcomingAppointments userId={user?.Id} onJoinMeeting={handleJoinMeeting} />,
        previous: () =><PreviousAppointments userId={user?.Id} onJoinMeeting={handleJoinMeeting} />,
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

const styles=StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
 contentContainer: { 
    flex: 1, 
    backgroundColor: '#fff',
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
  text: {
    fontSize: 16,
    color: '#000',
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
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
})

export default RemoteOrderListScreen