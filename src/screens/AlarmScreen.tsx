import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
} from 'react-native';
import { ROUTES } from '../shared/utils/routes';

const AlarmScreen = () => {
  const route = useRoute();
  const navigation=useNavigation()
  const {message} = route.params; 

  const onPressButton=()=>{
    navigation.navigate(ROUTES.Home)
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
          <Text style={styles.title}>Reminder for upcoming Appointment</Text>
          <Text style={styles.subtitle}>You have an upcoming session on</Text>
        </View>

        {/* Appointment Time */}
        <View style={styles.timeBox}>
          <Text style={styles.time}>04:00 PM</Text>
          <Text style={styles.date}>21/10/2024</Text>
        </View>

        <Text style={styles.note}>Please don’t forget to join the session</Text>

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
    fontSize: 24,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  date: {
    fontSize: 16,
    color: '#6B6B6B',
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
