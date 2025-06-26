import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location'; // If you use expo, otherwise use RN geolocation
import Icon from 'react-native-vector-icons/MaterialIcons'; // For cross and location icons

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 110;

const DEFAULT_REGION = {
  latitude: 31.5204, // Lahore default
  longitude: 74.3587,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapTab = () => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setLoading(true);
    // TODO: Replace with real reverse geocoding API call
    // Example: fetch address from Google Geocoding API
    // For now, use placeholder
    setTimeout(() => {
      setAddress('87W8+C9, Block M 8 Khan Wardag Dera Afghana, Lahore, باكستان');
      setCity('Lahore');
      setLoading(false);
    }, 1000);
  };

  const handleClear = () => {
    setMarker(null);
    setAddress('');
    setCity('');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Address input absolute at top */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={address}
          placeholder="اختر الموقع على الخريطة"
          editable={false}
        />
        {marker && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Icon name="close" size={22} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
        onPress={handleMapPress}
        showsUserLocation
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
      {/* Address Card below map */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>موقع الزيارة</Text>
        <View style={styles.cardBox}>
          <Text style={styles.city}>{city || '---'}</Text>
          <Text style={styles.address}>{address || '---'}</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>تأكيد الموقع</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  map: {
    width: width,
    height: height * 0.45,
    marginTop: 0,
  },
  cardContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  cardTitle: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  cardBox: {
    backgroundColor: '#e6f2f1',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  city: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2d3a4b',
    textAlign: 'right',
  },
  address: {
    fontSize: 15,
    color: '#2d3a4b',
    textAlign: 'right',
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: '#36a6ad',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapTab; 