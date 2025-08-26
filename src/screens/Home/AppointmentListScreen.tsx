import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationList, setTopic, setUser, setUnreadMessages } from '../../shared/redux/reducers/userReducer';
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

export interface Appointment {
  CardNumber: string | null;
  CardType: string;
  CatCategoryId: string;
  CatLevelId: string;
  CatOrderStatusId: string;
  CatSpecialtyId: string;
  Gender: number;
  ImagePath: string;
  OrderDate: string;
  OrderDetailId: string;
  OrderId: string;
  OrganizationId: string;
  OrganizationPlang: string;
  OrganizationSlang: string;
  PatientEmail: string;
  PatientPName: string;
  PatientPhone: string;
  PatientSName: string;
  PatientUserProfileInfoId: string;
  RelationOrderAndOrganizationCategoryId: string;
  SchedulingDate: string;
  SchedulingEndTime: string;
  SchedulingTime: string;
  ServiceCharges: number;
  ServicePrice: number;
  ServiceProviderId: string;
  ServiceProviderPName: string;
  ServiceProviderSName: string;
  Specialties: any[];
  TaskId: string;
  TaxAmt: number;
  TitlePlangCategory: string;
  TitlePlangService: string;
  TitlePlangSpecialty: string | null;
  TitleSlangCategory: string;
  TitleSlangService: string;
  TitleSlangSpecialty: string | null;
  UserLoginInfoId: string;
  UserWalletId: string;
  VideoSDKMeetingId: string;
  VisitMainId: string | null;
}

const AppointmentListScreen = ({ navigation }: any) => {
  const [index, setIndex] = useState(0);
  const isScreenFocused = useIsFocused();
  const timerRef = useRef<any>(null);
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.root.user.user);
  const { topic } = useSelector((state: any) => state.root.user);
  const { notificationList } = useSelector((state: any) => state.root.user);
  const webSocketService = WebSocketService.getInstance();
  const isFocused = useIsFocused();
  const [patientReminderList, setPatientReminderList] = useState<any[]>([]);
  const enabledAppointmentsRef = useRef<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [openGoogleMapBottomSheet, setOpenGoogleMapBottomSheet] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const unreadMessages = useSelector((state: any) => state.root.user.unreadMessages);
  const requestPermissions = async () => {
    return Platform.OS === 'ios' ? requestiOSPermissions() : requestAndroidPermissions();
  };

  useEffect(() => {
    if (user) {
      getNotificationList();
      getPatientReminderList();
    }
  }, [isFocused, user]);

  const checkTimeCondition = useCallback((appointment: Appointment) => {
    const now = moment();
    const appointmentDate = moment.utc(appointment?.SchedulingDate).local();
    const startTime = moment.utc(appointment?.SchedulingTime, 'HH:mm').local();
    const endTime = moment.utc(appointment?.SchedulingEndTime, 'HH:mm').local();

    startTime.set({
      year: appointmentDate.year(),
      month: appointmentDate.month(),
      date: appointmentDate.date()
    });
    endTime.set({
      year: appointmentDate.year(),
      month: appointmentDate.month(),
      date: appointmentDate.date()
    });

    return now.isSameOrAfter(startTime) &&
      now.isBefore(endTime) &&
      now.isSame(appointmentDate, 'day');
  }, []);

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

  // Separate effect for initial setup only - runs once
  useEffect(() => {
    // Initialize the ref
    enabledAppointmentsRef.current = new Set<string>();
  }, []);

  // Main effect for timer and WebSocket
  useEffect(() => {
    if (isScreenFocused) {
      // Start periodic unread message checking in the WebSocketService
      if (user) {
        webSocketService.startPeriodicUnreadCheck(user.Id, 5000);
      }

      // Set up interval for appointment status only
      timerRef.current = setInterval(() => {
        // Only process appointments if they exist
        if (patientReminderList?.length > 0) {
          const enabled = new Set<string>();
          let hasChanges = false;

          patientReminderList.forEach(appointment => {
            const isEnabled = checkTimeCondition(appointment);
            const appointmentId = `${appointment.OrderId}-${appointment.TaskId}`;

            if (isEnabled) {
              enabled.add(appointmentId);
            }

            // Check if the enabled state has changed
            if (isEnabled !== enabledAppointmentsRef.current.has(appointmentId)) {
              hasChanges = true;
            }
          });

          // Only update if there are actual changes
          if (hasChanges) {
            enabledAppointmentsRef.current = enabled;
            // Force a re-render of the FlatList
            setPatientReminderList(prev => [...prev]);
          }
        }
      }, 1000);
    }

    return () => {
      // Clean up appointment timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // We don't stop the WebSocketService periodic check here
      // because we want it to continue across screens
    };
  }, [isScreenFocused, user,patientReminderList]);

  

  const checkUnreadMessages = () => {
    if (user) {
      webSocketService.checkUnreadMessages(user.Id);
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
      } else {
        // If already connected, make sure the global handler is set
        webSocketService.addGlobalMessageHandler();
      }
      
      // Check for unread messages when screen is focused
      if (isScreenFocused) {
        checkUnreadMessages();
      }
    } else {
      webSocketService.disconnect();
    }
  }, [user, isScreenFocused]);

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
      // Update enabled appointments ref before setting state
      const reminderList = response.ReminderList;
      
      // Initialize the enabled appointments set
      const enabled = new Set<string>();
      
      // Check each appointment
      reminderList.forEach((appointment: any) => {
        if (checkTimeCondition(appointment)) {
          enabled.add(`${appointment.OrderId}-${appointment.TaskId}`);
        }
      });
      
      // Update the ref
      enabledAppointmentsRef.current = enabled;
      
      // Now set the state
      setPatientReminderList(reminderList);
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
      Name: appointment.FullnameSlang,
      displayName: appointment.PatientFullnameSlang,
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
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
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
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.ConversationListScreen)} style={{paddingLeft:15}}>
          <View style={{ position: 'relative' }}>
            <Ionicons name="chatbox" size={24} color="black" />
            {unreadMessages > 0 && (
              <View style={{ position: 'absolute', top: -15, right: -10, backgroundColor: 'red', padding: 5, width: 22, height: 22, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: 10, }}>{unreadMessages > 100 ? '99+' : unreadMessages}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        </View>
        
      }
    />
  );

  const isAppointmentEnabled = useCallback((appointment: any) => {
    return enabledAppointmentsRef.current.has(`${appointment.OrderId}-${appointment.TaskId}`);
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