import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { setTopic, setUser } from '../../shared/redux/reducers/userReducer';
import { styles } from '../../components/appointments/styles';
import CurrentAppointments from '../../components/appointments/CurrentAppointments';
import UpcomingAppointments from '../../components/appointments/UpcomingAppointments';
import PreviousAppointments from '../../components/appointments/PreviousAppointments';
import moment from 'moment';
import { ROUTES } from '../../shared/utils/routes';
import { useIsFocused } from '@react-navigation/native';

import WebSocketService from '../../components/WebSocketService';
import { notificationService } from '../../services/api/NotificationService';
import { requestAndroidPermissions, requestiOSPermissions, scheduleNotificationAndroid, scheduleNotificationIOS, subsribeTopic } from '../../shared/services/service';
import Header from '../../components/common/Header';

const AppointmentListScreen = ({navigation}: any) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.root.user.user);
  const {topic} = useSelector((state: any) => state.root.user);
  const webSocketService = WebSocketService.getInstance();
  const isFocused = useIsFocused();
  const requestPermissions = async () => {
    return Platform.OS === 'ios' ? requestiOSPermissions() : requestAndroidPermissions();
  };

  // Handle WebSocket connection
  // useEffect(() => {
    
  //   if (user) {
  //     const presence = 1;
  //     const communicationKey = user.CommunicationKey;
  //     const UserId = user.Id;
  //     subsribeTopic(UserId, topic, dispatch);
      
  //     // Only connect if not already connected
  //     if (!webSocketService.isSocketConnected()) {
  //       webSocketService.connect(presence, communicationKey, UserId);
  //     }
  //   } else {
  //     webSocketService.disconnect();
  //   }
  // }, [user]);

  const afterLogin = async () => {
    try {
      notificationService.getSystemNotification({
        UserloginInfo: user.Id,
      }).then((SystemNotificationList: any) => {
        if (Platform.OS === 'ios') {
          scheduleNotificationIOS(SystemNotificationList?.ReminderList);
        } else {
          scheduleNotificationAndroid(SystemNotificationList?.ReminderList);
        }
      }); 
    } catch (error) {
    }
  }

  // Initial permissions request
  useEffect(() => {
    requestPermissions();
  }, []);

  // Handle notifications when screen is focused
  useEffect(() => {
    if (user && isFocused) {
      afterLogin();
    }
  }, [user, isFocused]);

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
        <Text style={styles.headerTitle}>{t('appointments')}</Text>
      }
      rightComponent={
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.Services)} style={styles.bookButton}>
          <Text style={styles.bookButtonText}>{t('book_order')}</Text>
        </TouchableOpacity>
      }
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
  );
};

export default AppointmentListScreen; 