import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appointmentService, Appointment } from '../../services/api/appointmentService';
import AppointmentCard from './AppointmentCard';
import { styles } from './styles';

const PAGE_SIZE = 10;

interface PreviousAppointmentsProps {
  userId: string;
  onJoinMeeting: (meetingId: string) => void;
}

const PreviousAppointments: React.FC<PreviousAppointmentsProps> = ({ userId, onJoinMeeting }) => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchAppointments = async (page: number, append: boolean = false) => {
    if (!userId || isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await appointmentService.getAppointmentList({
        UserloginInfoId: userId,
        OrderMainStatus: '-1',
        OrderStatusId: null,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      });

      if (append) {
        setAppointments(prev => [...prev, ...response.UserOrders]);
      } else {
        setAppointments(response.UserOrders);
      }

      console.log('response.UserOrders====>', response.UserOrders);

      if(response?.UserOrders?.length > 0 && response?.TotalRecord > PAGE_SIZE*page){
        setIsLoadingMore(true);
      }else{
        setIsLoadingMore(false);
      }

      console.log('response.UserOrders====>', response);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching current appointments:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  console.log('isLoadingMore====>', isLoadingMore);

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

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  };

  return (
    <FlatList
      data={appointments}
      renderItem={({ item }) => (
        <AppointmentCard
          appointment={item}
          onJoinMeeting={onJoinMeeting}
        />
      )}
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
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
};

export default PreviousAppointments; 