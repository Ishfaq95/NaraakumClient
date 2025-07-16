import OnlineDoctorIcon from '../assets/icons/OnlineDoctorIcon';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { globalTextStyles } from '../styles/globalStyles';

interface ServiceCardProps {
  item: any;
  style?: object;
  onPress: (item: any) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ item, style, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={1} onPress={() => onPress(item)}>
      <LinearGradient
        colors={['#faf2ef', '#faf2ef', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.card, style]}
      >
        <View style={[{ height: '45%' },Platform.OS === 'ios' ? {paddingLeft:30} : {}]}>
          <Text style={{ ...globalTextStyles.bodyMedium, alignSelf:'flex-start', fontFamily: globalTextStyles.h5.fontFamily, color: '#209092' }}>خدمات</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.description}</Text>
          <Text style={styles.price}>{`تبدأ من ${item.Price} ريال`}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', justifyContent: 'center', height: '50%' }}>
          {item.Image}
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: Platform.OS === 'ios' ? 300 : 300,
    width:'100%',
    borderRadius: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginHorizontal: 10,
    backgroundColor: '#e6f2f2',
  },
  title: {
    alignSelf:'flex-start',
    ...globalTextStyles.h2,
    color: '#209092',
    marginBottom: 6,
  },
  subtitle: {
    alignSelf:'flex-start',
    ...globalTextStyles.bodySmall,
    color: '#444',
    marginBottom: 10,
  },
  price: {
    alignSelf:'flex-start',
    ...globalTextStyles.h4,
    color: '#179c8e',
  },
});

export default ServiceCard; 