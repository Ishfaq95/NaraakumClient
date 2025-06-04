import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../shared/redux/reducers/userReducer';
import { styles } from '../../components/appointments/styles';
import CurrentAppointments from '../../components/appointments/CurrentAppointments';
import UpcomingAppointments from '../../components/appointments/UpcomingAppointments';
import PreviousAppointments from '../../components/appointments/PreviousAppointments';
import { TimestampTrigger } from '@notifee/react-native';
import { TriggerType } from '@notifee/react-native';
import moment from 'moment';
import { ROUTES } from '../../shared/utils/routes';

const AppointmentListScreen = React.memo(({navigation}: any) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: any) => state.root.user.user);


  const onLogout = () => {
    dispatch(setUser(null));
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
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>{t('appointments')}</Text>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>{t('book_order')}</Text>
      </TouchableOpacity>
    </View>
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
    current: () => <CurrentAppointments userId={userInfo?.Id} onJoinMeeting={handleJoinMeeting} />,
    upcoming: () => <UpcomingAppointments userId={userInfo?.Id} onJoinMeeting={handleJoinMeeting} />,
    previous: () =><PreviousAppointments userId={userInfo?.Id} onJoinMeeting={handleJoinMeeting} />,
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
});

export default AppointmentListScreen; 