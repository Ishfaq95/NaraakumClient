import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Platform, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { setSelectedLocation } from '../../shared/redux/reducers/bookingReducer';
import { useDispatch } from 'react-redux';
import { globalTextStyles } from '../../styles/globalStyles';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // For cross and location icons

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 110;

const DEFAULT_REGION = {
  latitude: 31.5204, // Lahore default
  longitude: 74.3587,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapTab = ({ onPressLocation }: { onPressLocation: () => void }) => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarker({ latitude, longitude });
        
        // Center the marker in the screen view but preserve zoom level
        if (mapRef.current) {
          // Get current map boundaries to preserve zoom
          mapRef.current.getMapBoundaries().then((bounds) => {
            const currentZoom = {
              latitudeDelta: bounds.northEast.latitude - bounds.southWest.latitude,
              longitudeDelta: bounds.northEast.longitude - bounds.southWest.longitude,
            };
            
            // Center on current location with current zoom
            mapRef.current?.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: currentZoom.latitudeDelta,
              longitudeDelta: currentZoom.longitudeDelta,
            }, 1000);
          });
        }
        
        // Get address for current location
        getAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        Alert.alert('Location Error', 'Unable to get your current location. Please select a location on the map.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      // Use Google Geocoding API to get address from coordinates in Arabic
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDrIDwxB952Xv0ogIH6ytLJ_iKfxfadfEM&language=ar&region=SA`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        // Extract city/locality in Arabic
        let city = '';
        const cityComponent = addressComponents.find(
          (component: any) => 
            component.types.includes('locality') || 
            component.types.includes('administrative_area_level_1')
        );
        if (cityComponent) {
          // Use Arabic name if available, otherwise use English
          city = cityComponent.long_name;
        }
        
        // Use formatted address in Arabic
        const address = result.formatted_address;
        
        setAddress(address);
        setCity(city || 'موقع غير معروف');
      } else {
        // Fallback if geocoding fails
        setAddress(`الموقع (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setCity('موقع غير معروف');
      }
    } catch (error) {
      // Fallback if API call fails
      setAddress(`الموقع (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      setCity('موقع غير معروف');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    
    // Center the marker in the screen view but preserve zoom level
    if (mapRef.current) {
      // Get current map boundaries to preserve zoom
      mapRef.current.getMapBoundaries().then((bounds) => {
        const currentZoom = {
          latitudeDelta: bounds.northEast.latitude - bounds.southWest.latitude,
          longitudeDelta: bounds.northEast.longitude - bounds.southWest.longitude,
        };
        
        // Center on new marker position with current zoom
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: currentZoom.latitudeDelta,
          longitudeDelta: currentZoom.longitudeDelta,
        }, 1000);
      });
    }
    
    getAddressFromCoordinates(latitude, longitude);
  };

  const handleClear = () => {
    setMarker(null);
    setAddress('');
    setCity('');
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  const handleConfirmLocation = () => {
    dispatch(setSelectedLocation({
      latitude: marker?.latitude,
      longitude: marker?.longitude,
      address: address,
      city: city,
    }));

    onPressLocation();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Address input absolute at top */}
      {/* <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={address}
          placeholder="اختر الموقع على الخريطة"
          editable={false}
        />
        <TouchableOpacity style={styles.currentLocationButton} onPress={handleUseCurrentLocation}>
          <Text style={styles.currentLocationText}>📍</Text>
        </TouchableOpacity>
        {marker && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Icon name="close" size={22} color="#333" />
          </TouchableOpacity>
        )}
      </View> */}
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
      >
        {marker && (
          <Marker 
            coordinate={marker} 
            onPress={() => {
              // Center map on marker when marker is tapped
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 1000);
              }
            }}
          />
        )}
      </MapView>
      {/* Address Card below map */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>موقع الزيارة</Text>
        <View style={styles.cardBox}>
          <Text style={styles.city}>{city || '---'}</Text>
          <Text style={styles.address}>{address || '---'}</Text>
        </View>
        <TouchableOpacity onPress={handleConfirmLocation} style={styles.confirmButton}>
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
  currentLocationButton: {
    marginLeft: 8,
    padding: 4,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  map: {
    flex: 1,
    width: width,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    textAlign: 'left',
    paddingTop: 10,
    fontWeight: 'bold',
    ...globalTextStyles.bodyMedium,
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
    ...globalTextStyles.bodyMedium,
    color: '#2d3a4b',
    textAlign: 'left',
  },
  address: {
    ...globalTextStyles.bodySmall,
    color: '#2d3a4b',
    textAlign: 'left',
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
    fontWeight: 'bold',
    ...globalTextStyles.bodyMedium,
    color: '#fff',
  },
});

export default MapTab; 