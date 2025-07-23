import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { CAIRO_FONT_FAMILY } from '../styles/globalStyles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import Geolocation from '@react-native-community/geolocation';
import { useTranslation } from 'react-i18next';
import { GOOGLE_MAP_API_KEY } from '../shared/utils/constants';

interface GoogleMapComponentProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };

  marker: {
    latitude: number;
    longitude: number;
  };
  onClosePress: () => void;
  setDescriptionValue: (value: string) => void;
  descriptionValue: string;
  saveMapAddressButton: () => void;
  AddManuallyButton: () => void;
  setSelectedAddress: (value: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  }) => void;
  selectedAddress: any;
  setFocusedField: (value: string) => void;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  onClosePress,
  setDescriptionValue,
  descriptionValue,
  saveMapAddressButton,
  AddManuallyButton,
  selectedAddress,
  setSelectedAddress,
  setFocusedField,
}) => {
  const mapRef = useRef<MapView>(null);
  const { t } = useTranslation();
  const descriptionInputRef = useRef<TextInput>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 24.7136, // Riyadh
    longitude: 46.6753,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
 
  const [loading, setLoading] = useState(false);
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
 
 
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
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAP_API_KEY}&language=ar&region=SA`
      );
      const data = await response.json();

      let address = `الموقع (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      let city = 'موقع غير معروف';

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        address = result.formatted_address;
        const addressComponents = result.address_components;
        const cityComponent = addressComponents.find(
          (component: any) =>
            component.types.includes('locality') ||
            component.types.includes('administrative_area_level_1')
        );
        if (cityComponent) {
          city = cityComponent.long_name;
        }
      }

      setSelectedAddress({
        latitude,
        longitude,
        address,
        city,
      });
      console.log('Selected Location Details:', { latitude, longitude, city, address });
    } catch (error) {
      setSelectedAddress({
        latitude,
        longitude,
        address: `الموقع (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        city: 'موقع غير معروف',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setRegion({
      ...region,
      latitude,
      longitude,
    });
    getAddressFromCoordinates(latitude, longitude);
  };

  return (
    <>
      <View style={styles.sheetHeaderContainer}>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="close" size={30} color="#979e9eff" />
        </TouchableOpacity>
        <Text style={styles.bottomSheetHeaderText}>اضافة عنوان</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          }}
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          region={region}
          onPress={handleMapPress} 
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
          }}
        >
          {marker && (
            <Marker
              coordinate={marker}
              draggable
              onDragEnd={handleMapPress}
              title="Selected Location"
              description="Drag or tap to select a location"
              tracksViewChanges={false}
              pinColor='red'
             
            >
              <Callout>
                <View style={{ padding: 10, width: 250 }}>
                  <Text style={{ fontSize: 14, fontFamily: CAIRO_FONT_FAMILY.regular }}>{selectedAddress.address}</Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>
        <View style={styles.searchBarContainer}>
        <TouchableOpacity onPress={() => placesRef.current?.focus()} style={styles.container}>
            <GooglePlacesAutocomplete
              ref={placesRef}
              listViewDisplayed={true}
              onPress={(data, details = null) => {
                if (details && details.geometry && details.geometry.location) {
                  const { lat, lng } = details.geometry.location;
                  setMarker({ latitude: lat, longitude: lng });
                  setRegion({
                    ...region,
                    latitude: lat,
                    longitude: lng,
                  });
                  getAddressFromCoordinates(lat, lng);
                }
              }}
              predefinedPlaces={[]}
            textInputProps={{
              editable: true,
              clearButtonMode:'never',
            }}
            placeholder="ابحث عن الموقع"
            minLength={2}
            fetchDetails={true}      
            renderRightButton={() => (
              <TouchableOpacity
              onPress={() => {
                // Clear the input when custom cross is pressed
                if (placesRef.current) {
                  placesRef.current.setAddressText('');
                }
              }}
              style={styles.leftIconContainer}
              
                
            >
              <AntDesign name="close" size={17} color="#fff" />
            </TouchableOpacity>
            )}
            query={{
              key: GOOGLE_MAP_API_KEY,
              language: 'ar',
              region: 'SA'
            }}
            styles={{
              textInputContainer: styles.textInputContainer,
              textInput: styles.textInput,
              listView: {
                position: 'absolute',
                top: 48,
                zIndex: 9999,
                backgroundColor: '#fff',
                width: '100%',
                elevation: 10,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              },
              
            }}
          />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.whiteContainer}>


        <View style={styles.selectedAddressContainer}>
          <Text style={styles.titleText}>{t(selectedAddress.city)}</Text>
          <Text style={styles.titleText}>{t(selectedAddress.address)}</Text>
        </View>


        <TouchableOpacity
          activeOpacity={1}
          onPress={() => descriptionInputRef.current && descriptionInputRef.current.focus()}
          style={styles.inputView}
        >
          <TextInput
            ref={descriptionInputRef}
            style={[styles.fullWidthInput]}
            placeholder="وصف العنوان مع رقم المبنى ورقم الشقة"
            value={descriptionValue}
            onChangeText={text => {
              setDescriptionValue(text);
            }}
            onFocus={() => setFocusedField && setFocusedField('description')}
            onBlur={() => setFocusedField && setFocusedField('')}
            placeholderTextColor={'#d9d9d9'}
          />
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity onPress={saveMapAddressButton} style={styles.optButton}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={AddManuallyButton} style={styles.googleButton}>
          <Text style={[styles.saveBtnText, { color: '#000', fontFamily: CAIRO_FONT_FAMILY.regular }]}>
            او أختر المدينة والمنطقة <Text style={{ color: '#23a2a4', fontFamily: CAIRO_FONT_FAMILY.regular }}>مباشرة</Text></Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
export default GoogleMapComponent;

const styles = StyleSheet.create({
  sheetHeaderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E4F1EF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  inputView: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e0dedeff',
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bottomSheetHeaderText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#36454F',

  },
  saveBtnText: {
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    fontSize: 14,
  },
  optButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23a2a4',
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 7
  },
  googleButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#23a2a4',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10,
    backgroundColor: '#FAFAFA'
  },
  whiteContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  titleText: {
    color: '#36454F',
    fontSize: 13,
    fontFamily: CAIRO_FONT_FAMILY.medium,
    marginBottom: 2
  },
  fullWidthInput: {
    flex: 1,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000',
    textAlign: 'right'
  },
  selectedAddressContainer: {
    width: '100%',
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e0dedeff',
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#E4F1EF',
    paddingHorizontal: 20,
  },
  mapContainer: {
    width: '100%',
    height: '50%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchBarContainer: {
    width: '90%',
    height: 50,
    alignSelf: 'center',
    borderRadius: 8,
    position: 'absolute',
    top: 10,
    backgroundColor: '#fff',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBarCloseButton: {
    padding: 10,
  },
  searchBarInput: {
    flex: 1,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000',
    textAlign: 'right'
  },
  container: {
    width:'100%',
    height:'50%',
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
  },
  textInputContainer: {
    width: "100%",
    height: 48,
    backgroundColor: "#EFF6FF",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 10,
    // overflow: "hidden",
  },
  textInput: {
    backgroundColor: "transparent",
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    fontWeight: "400",
    height: 48,
    zIndex: 1,
    textAlign: 'right',
  },
  leftIconContainer: {
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: "center",
    alignItems: "center",
    alignSelf: 'center',
    marginRight: 10,
  },
  rightIconContainer: {
    width: "10%",
    height: 48,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    right: 4,
  },
})
