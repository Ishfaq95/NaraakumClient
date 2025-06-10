import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appointmentService, Appointment } from '../../services/api/appointmentService';
import AppointmentCard from '../appointments/AppointmentCard';
import { styles } from '../appointments/styles';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import NoAppointmentsIcon from '../../assets/icons/NoAppointmentsIcon';

const PAGE_SIZE = 10;

interface CurrentAppointmentsProps {
  userId: string;
  onJoinMeeting: (meetingId: string) => void;
}

const CurrentAppointments: React.FC<CurrentAppointmentsProps> = ({ userId, onJoinMeeting }) => {
  const { t } = useTranslation();
  const isScreenFocused = useIsFocused();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const enabledAppointmentsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const isAppointmentEnabled = useCallback((appointment: Appointment) => {
    return enabledAppointmentsRef.current.has(`${appointment.OrderId}-${appointment.OrderDetailId}`);
  }, []);

  const fetchAppointments = async (page: number, append: boolean = false) => {
    if (!userId || isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await appointmentService.getAppointmentList({
        UserloginInfoId: userId,
        OrderMainStatus: '0',
        OrderStatusId: null,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      });

      if (append) {
        setAppointments(prev => [...prev, ...response.UserOrders]);
      } else {
        setAppointments(response.UserOrders);
      }

      if(response?.UserOrders?.length > 0 && response?.TotalRecord > PAGE_SIZE*page){
        setIsLoadingMore(true);
      }else{
        setIsLoadingMore(false);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching current appointments:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && isLoadingMore) {
      fetchAppointments(currentPage + 1, true);
    }
  };

  const refreshList = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      setCurrentPage(1);
      fetchAppointments(1);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments(1);
    }
  }, [userId]);

  useEffect(() => {
    if (isScreenFocused && appointments?.length > 0) {
      // Initial check
      const enabled = new Set<string>();
      appointments.forEach(appointment => {
        if (checkTimeCondition(appointment)) {
          enabled.add(`${appointment.OrderId}-${appointment.OrderDetailId}`);
        }
      });
      enabledAppointmentsRef.current = enabled;
      
      // Set up interval
      timerRef.current = setInterval(() => {
        if (!appointments?.length) {
          return;
        }
        const enabled = new Set<string>();
        let hasChanges = false;

        appointments.forEach(appointment => {
          const isEnabled = checkTimeCondition(appointment);
          const appointmentId = `${appointment.OrderId}-${appointment.OrderDetailId}`;
          
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
          setAppointments(prev => [...prev]);
        }
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isScreenFocused, appointments, checkTimeCondition]);

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: Appointment }) => (
    <AppointmentCard
      appointment={item}
      onJoinMeeting={onJoinMeeting}
      isCallEnabled={isAppointmentEnabled(item)}
    />
  ), [onJoinMeeting, isAppointmentEnabled]);

  if(isLoading && appointments.length === 0){
    return (
      <View style={styles.emptyContentContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.OrderId}-${item.OrderDetailId}`}
      contentContainerStyle={styles.contentContainer}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshList}
          colors={['#008080']}
        />
      }
      removeClippedSubviews={true}
      ListEmptyComponent={() => (
        <View style={styles.emptyContentContainer}>
          <NoAppointmentsIcon />
          <Text style={styles.text}>{t('no_appointments')}</Text>
        </View>
      )}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
};

export default CurrentAppointments; 