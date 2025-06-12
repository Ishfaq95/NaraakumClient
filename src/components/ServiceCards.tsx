import OnlineDoctorIcon from '../assets/icons/OnlineDoctorIcon';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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
        <View style={{ height: '45%' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#209092' }}>خدمات</Text>
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
    height: 300,
    width: '100%',
    borderRadius: 16,
    padding: 16,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#209092',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    color: '#179c8e',
    fontWeight: 'bold',
  },
});

export default ServiceCard; 