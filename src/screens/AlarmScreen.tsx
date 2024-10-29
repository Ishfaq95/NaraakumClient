import {useNavigation, useRoute} from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import { ROUTES } from '../shared/utils/routes';
import moment from 'moment-timezone';



const { AlarmModule } = NativeModules;

const AlarmScreen = () => {
  const route = useRoute();
  const navigation=useNavigation()
  const Data = route.params; // Get the message from the navigation params
  const [description,setDescription]=useState('')
  const [remainingTime, setRemainingTime] = useState('');

  const NotificationBody=Data?.data?.NotificationBody
  const ReminderDate=Data?.data?.ReminderDate
  const Subject=Data?.data?.Subject

  useEffect(()=>{
    getDescription()
  },[NotificationBody,ReminderDate])

  const calculateRemainingTime = () => {
    // const localDate = moment.utc(ReminderDate).local(); // Convert UTC to local date
    const localDate = moment(ReminderDate)
    const currentDate = moment(); // Current local date and time
    const duration = moment.duration(localDate.diff(currentDate)); // Difference between event date and current date

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(duration.asHours()); // Get total hours
    const minutes = Math.floor(duration.minutes()); // Get remaining minutes
    const seconds = Math.floor(duration.seconds()); // Get remaining seconds

    // Update remaining time string
    setRemainingTime(`${hours}:${minutes}:${seconds}`);
  };

  useEffect(() => {
    // Calculate the remaining time when the component mounts
    calculateRemainingTime();

    // Set an interval to update the countdown every second
    const interval = setInterval(() => {
      calculateRemainingTime();
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [ReminderDate]);


  const getDescription=()=>{
    if(NotificationBody && ReminderDate){
      replaceUTCWithLocalDate(NotificationBody,ReminderDate)
    }
  }

  const onPressButton=()=>{
    // AlarmModule.scheduleAlarm(30,"لديك جلسة قادمة في {0} بتوقيت UTC . الرجاء عدم نسيان الانضمام للجلسة.","تذكير بالجلسة القادمة",1001,"2024-10-29T20:00:00.000Z","h13f-r2kv-l2wn")
    navigation.navigate(ROUTES.Home)
  }

  function replaceUTCWithLocalDate(message, utcDate) {
    // Convert UTC date to local mobile date
    const localDate = moment.utc(utcDate).local().format('YYYY-MM-DD HH:mm:ss');
  
    // Replace {0} in the message with the local date
    const updatedMessage = message.replace('{0}', localDate);
  
    setDescription( updatedMessage);
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={{marginTop: 25}}>
        <Image
          source={require('../assets/icons/NaraakumLogo.png')} // replace with the logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Reminder Section */}
      <View style={styles.reminderBox}>
        <View
          style={{
            position: 'absolute',
            height: 80,
            width: 80,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 100,
            marginTop: -40,
            paddingTop: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}>
          <Image
            source={require('../assets/icons/AlarmIcon.png')} // replace with the clock icon path
            style={styles.clockIcon}
          />
        </View>
        <View
          style={{
            marginTop: 30,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.title}>{Subject}</Text>
        </View>

        {/* Appointment Time */}
        <View style={styles.timeBox}>
          <Text style={styles.time}>Time Left</Text>
          <Text style={styles.date}>{remainingTime}</Text>
        </View>

        <Text style={styles.note}>{description}</Text>

        {/* OK Button */}
        <TouchableOpacity onPress={onPressButton} style={styles.okButton}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F0F4',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 100,
    marginBottom: 30,
  },
  reminderBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '85%',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  clockIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2B2B2B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 15,
  },
  timeBox: {
    backgroundColor: '#E9F5F7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  time: {
    fontSize: 16,
    color: '#6B6B6B',
  },
  date: {
    
    fontSize: 24,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  note: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#0A9F9D',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 5,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlarmScreen;
