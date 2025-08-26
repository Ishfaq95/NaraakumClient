import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import LoginScreen from '../screens/LoginScreen';
import AppointmentListScreen from '../screens/Home/AppointmentListScreen';
import HomeScreen from '../screens/Home';
import AlarmScreen from '../screens/AlarmScreen';
import NetworkErrorScreen from '../screens/NetworkScreen';
import PreViewScreen from '../screens/VideoSDK/preViewScreen';
import VideoCallScreen from '../screens/VideoSDK/VideoCallScreen';
import meeting from '../screens/meeting';
import { ROUTES } from '../shared/utils/routes';
import AuthWelcomeScreen from '../screens/AuthWelcomeScreen';
import AppNavigator from './AppNavigator';
import Services from '../screens/Booking/Services';
import BookingScreen from '../screens/Booking/BookingScreen';
import OrderSuccess from '../components/bookingSteps/OrderSuccess';
import VisitOrderListScreen from '../screens/Profile/VisitOrderListScreen';
import RemoteOrderListScreen from '../screens/Profile/RemoteOrderListScreen';
import VisitConsultantLogScreen from '../screens/Profile/VisitConsultantLogScreen';
import ReservationReceivedScreen from '../screens/Profile/ReservationReceivedScreen';
import RemoteMonitoringScreen from '../screens/Profile/RemoteMonitoringScreen';
import MyRatingScreen from '../screens/Profile/MyRatingScreen';
import WalletBalanceScreen from '../screens/Profile/WalletBalanceScreen';
import MyAddressesScreen from '../screens/Profile/MyAddressesScreen';
import BeneficiariesScreen from '../screens/Profile/BeneficiariesScreen';
import FavoritesScreen from '../screens/Profile/FavoritesScreen';
import DeleteScreen from '../screens/Profile/DeleteScreen';
import UpdateProfileScreen from '../screens/Profile/UpdateProfileScreen';
import OrderDetailScreen from '../screens/Profile/OrderDetailScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ConversationListScreen from '../screens/Chat/ConversationListScreen';
import ChatScreenMainView from '../screens/Chat/ChatScreenMainView';
import CustomPhoneInputDemo from '../components/common/CustomPhoneInputDemo';
import ForgotPassword from '../screens/ForgotPassword/ForgotPassword';
import ForgotOTP from '../screens/ForgotPassword/ForgotOTP';
import ConfirmPassword from '../screens/ForgotPassword/ConfirmPassword';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const user = useSelector((state: any) => state.root.user.user);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name={'CustomPhoneInputDemo'} component={CustomPhoneInputDemo} /> */}
        <Stack.Screen name={ROUTES.AuthWelcome} component={AuthWelcomeScreen} />
        <Stack.Screen name={ROUTES.Login} component={LoginScreen} />
        <Stack.Screen name={ROUTES.ForgotPassword} component={ForgotPassword} />
        <Stack.Screen name={ROUTES.ForgotOTP} component={ForgotOTP} />
        <Stack.Screen name={ROUTES.ConfirmPassword} component={ConfirmPassword} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.AppNavigator} component={AppNavigator} />
      <Stack.Screen name={ROUTES.AppointmentList} component={AppointmentListScreen} />
      <Stack.Screen name={ROUTES.Home} component={HomeScreen} />
      <Stack.Screen name={ROUTES.AlarmScreen} component={AlarmScreen} />
      <Stack.Screen name={ROUTES.NetworkError} component={NetworkErrorScreen} />
      <Stack.Screen name={ROUTES.preViewCall} component={PreViewScreen} />
      <Stack.Screen name={ROUTES.VideoCallScreen} component={VideoCallScreen} />
      <Stack.Screen name={ROUTES.Meeting} component={meeting} />

      <Stack.Screen name={ROUTES.OrderSuccess} component={OrderSuccess} />

      {/* Profile section */}
      <Stack.Screen name={ROUTES.updateProfile} component={UpdateProfileScreen} />
      <Stack.Screen name={ROUTES.visitOrderList} component={VisitOrderListScreen} />
      <Stack.Screen name={ROUTES.remoteOrderList} component={RemoteOrderListScreen} />
      <Stack.Screen name={ROUTES.visit_consultant_log} component={VisitConsultantLogScreen} />
      <Stack.Screen name={ROUTES.reservationReceived} component={ReservationReceivedScreen} />
      <Stack.Screen name={ROUTES.remoteMonitoring} component={RemoteMonitoringScreen} />
      <Stack.Screen name={ROUTES.myRating} component={MyRatingScreen} />
      <Stack.Screen name={ROUTES.walletBalance} component={WalletBalanceScreen} />
      <Stack.Screen name={ROUTES.myAddresses} component={MyAddressesScreen} />
      <Stack.Screen name={ROUTES.beneficiaries} component={BeneficiariesScreen} />
      <Stack.Screen name={ROUTES.favorites} component={FavoritesScreen} />
      <Stack.Screen name={ROUTES.delete} component={DeleteScreen} />
      <Stack.Screen name={ROUTES.OrderDetailScreen} component={OrderDetailScreen} />
      <Stack.Screen name={ROUTES.NotificationScreen} component={NotificationScreen} />
      <Stack.Screen name={ROUTES.ConversationListScreen} component={ConversationListScreen} />
      <Stack.Screen name={ROUTES.ChatScreenMainView} component={ChatScreenMainView} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
