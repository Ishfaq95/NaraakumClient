import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationList, setTopic, setUser } from '../../shared/redux/reducers/userReducer';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { bookingService } from '../../services/api/BookingService';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import FullScreenLoader from '../../components/FullScreenLoader';
import AppointmentVisitCard from '../../components/appointments/AppointmentVisitCard';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import { globalTextStyles } from '../../styles/globalStyles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AppointmentTrackingMap from '../../components/AppointmentTrackingMap';

const AppointmentListScreen = ({ navigation }: any) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.root.user.user);
  const { topic } = useSelector((state: any) => state.root.user);
  const { notificationList } = useSelector((state: any) => state.root.user);
  const webSocketService = WebSocketService.getInstance();
  const isFocused = useIsFocused();
  const [patientReminderList, setPatientReminderList] = useState([]);
  const enabledAppointmentsRef = useRef<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [openGoogleMapBottomSheet, setOpenGoogleMapBottomSheet] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const requestPermissions = async () => {
    return Platform.OS === 'ios' ? requestiOSPermissions() : requestAndroidPermissions();
  };

  useEffect(() => {
    if (user) {
      getNotificationList();
      getPatientReminderList();
    }
  }, [isFocused, user]);

  const getNotificationList = async () => {
    const payload = {
      "ReciverId": user.Id,
      "Viewstatus": 0,
      "PageNumber": 1,
      "PageSize": 10
    }
    const response = await notificationService.getNotificationList(payload);

    if (response.ResponseStatus.STATUSCODE == 200) {
      dispatch(setNotificationList(response.TotalRecord));
    }
  }

  // Handle WebSocket connection
  useEffect(() => {

    if (user) {
      const presence = 1;
      const communicationKey = user.CommunicationKey;
      const UserId = user.Id;
      subsribeTopic(UserId, topic, dispatch);

      // Only connect if not already connected
      if (!webSocketService.isSocketConnected()) {
        webSocketService.connect(presence, communicationKey, UserId);
      }
    } else {
      webSocketService.disconnect();
    }
  }, [user]);

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

  const getPatientReminderList = async () => {
    setIsLoading(true);
    const payload = {
      "ReceiverId": user?.Id,
      "PageNumber": 1,
      "PageSize": 100
    }
    const response = await bookingService.getPatientReminderList(payload);
    if (response.ResponseStatus.STATUSCODE == 200) {
      setPatientReminderList(response.ReminderList);
    }
    setIsLoading(false);
  }

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

    navigation.navigate(ROUTES.preViewCall, { Data: meetingInfo });
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
      leftComponent={
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.NotificationScreen)} style={{}}>
          <View style={{ position: 'relative' }}>
            <Ionicons name="notifications" size={24} color="black" />
            {notificationList > 0 && (
              <View style={{ position: 'absolute', top: -20, right: -10, backgroundColor: 'red', padding: 5, width: 30, height: 30, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: 10, }}>{notificationList > 100 ? '99+' : notificationList}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      }
    />
  );

  const isAppointmentEnabled = useCallback((appointment: any) => {
    return enabledAppointmentsRef.current.has(`${appointment.OrderId}-${appointment.OrderDetailId}`);
  }, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <AppointmentCard
      appointment={item}
      onJoinMeeting={handleJoinMeeting}
      isCallEnabled={isAppointmentEnabled(item)}
    />
  ), [handleJoinMeeting, isAppointmentEnabled]);

  const onPressMapButton = (appointment: any) => {
    setOpenGoogleMapBottomSheet(true);
    setSelectedAppointment(appointment);
  }

  const rendervisitItem = useCallback(({ item }: { item: any }) => (
    <AppointmentVisitCard appointment={item} onPressMapButton={onPressMapButton} />
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ flex: 1, backgroundColor: '#e4f1ef', padding: 10 }}>
        <FlatList
          data={patientReminderList}
          renderItem={({ item }) => item?.CatCategoryId == "42" ? renderItem({ item }) : rendervisitItem({ item })}
          keyExtractor={(item) => item?.TaskId?.toString()}
          ListEmptyComponent={
            <View style={{ height: "100%", paddingTop:"50%", justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ ...globalTextStyles.bodyLarge, color: '#000', fontWeight: '600',textAlign:"left" }}>لا توجد تذكيرات</Text>
            </View>
          }
        />
      </View>

      <CustomBottomSheet
        visible={openGoogleMapBottomSheet}
        onClose={() => setOpenGoogleMapBottomSheet(false)}
        height={'80%'}
        backdropClickable={false}
        showHandle={false}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <View style={{ height: 50, width: '100%', backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
            <Text style={[globalTextStyles.bodyLarge, { fontWeight: '600', color: '#000' }]}>تتبع وصول المعالج</Text>
            <TouchableOpacity onPress={() => setOpenGoogleMapBottomSheet(false)}>
              <AntDesign name="close" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={{paddingHorizontal: 16 }}>
            <View style={{flexDirection:"row",alignItems: "center",justifyContent:"space-between" }}>
              <View style={{alignItems:"flex-start",justifyContent:"flex-start"}}>
                <Text style={{ ...globalTextStyles.bodyLarge, color: '#000', fontWeight: '600',textAlign:"left" }}>{selectedAppointment?.FullnameSlang}</Text>
                <Text style={{ ...globalTextStyles.bodyMedium, color: '#000', fontWeight: '600',textAlign:"left" }}>{selectedAppointment?.OrganizationSlang}</Text>
                <Text style={{ ...globalTextStyles.bodyMedium, color: '#000', fontWeight: '600',textAlign:"left" }}>{selectedAppointment?.CellNumber}</Text>
              </View>
            </View>

          </View>
          <View style={{flex:1, borderRadius:10,padding:10}}>
            {selectedAppointment && (
              <AppointmentTrackingMap 
                appointment={selectedAppointment} 
                onRouteInfoUpdate={(info) => setRouteInfo(info)}
              />
            )}
          </View>
        </View>
      </CustomBottomSheet>
      <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  );
};

export default AppointmentListScreen; 