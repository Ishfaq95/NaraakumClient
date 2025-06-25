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

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const state = useSelector((state: any) => state);
  const user = useSelector((state: any) => state.root.user.user);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.AuthWelcome} component={AuthWelcomeScreen} />
        <Stack.Screen name={ROUTES.Login} component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.OrderSuccess} component={OrderSuccess} />
      <Stack.Screen name={ROUTES.AppNavigator} component={AppNavigator} />
      <Stack.Screen name={ROUTES.AppointmentList} component={AppointmentListScreen} />
      <Stack.Screen name={ROUTES.Home} component={HomeScreen} />
      <Stack.Screen name={ROUTES.AlarmScreen} component={AlarmScreen} />
      <Stack.Screen name={ROUTES.NetworkError} component={NetworkErrorScreen} />
      <Stack.Screen name={ROUTES.preViewCall} component={PreViewScreen} />
      <Stack.Screen name={ROUTES.VideoCallScreen} component={VideoCallScreen} />
      <Stack.Screen name={ROUTES.Meeting} component={meeting} />

      

      
    </Stack.Navigator>
  );
};

export default RootNavigator;
