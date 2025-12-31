import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Text, TextInput, TouchableOpacity, Alert, Platform, PermissionsAndroid, Linking, Image } from 'react-native';
import MapView, { Callout, MapPressEvent, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { CAIRO_FONT_FAMILY } from '../styles/globalStyles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import { GOOGLE_MAP_API_KEY } from '../shared/utils/constants';
import CustomAlertModal from './common/CustomAlertModal';

const { width, height } = Dimensions.get('window');

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

const DEFAULT_REGION = {
  latitude: 24.7136, 
    longitude: 46.6753,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

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
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const [permissionModal, setPermissionModal]=useState(false)

  console.log("selectedAddress",selectedAddress)

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  
        if (result === RESULTS.GRANTED) {
          return true;
        } else if (
          result === RESULTS.BLOCKED 
        ) {
          setPermissionModal(true);
          return false;
        } else {
          return false;
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
  
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setPermissionModal(true);
          return false;
        } 
      }
    } catch (error) {
    }
  };

  const getCurrentLocation = async () => {
    const permission = await requestLocationPermission();
    if (!permission) return;
  
    Geolocation.getCurrentPosition(
      (position) => {
        // ✅ position is available here
        console.log("Position:", position);
        const { latitude, longitude } = position.coords;
  
        setMarker({ latitude, longitude });
  
        if (mapRef.current) {
          mapRef.current.getMapBoundaries().then((bounds) => {
            const currentZoom = {
              latitudeDelta: bounds.northEast.latitude - bounds.southWest.latitude,
              longitudeDelta: bounds.northEast.longitude - bounds.southWest.longitude,
            };
  
            mapRef.current?.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: currentZoom.latitudeDelta,
                longitudeDelta: currentZoom.longitudeDelta,
              },
              1000
            );
          });
        }
  
        getAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        console.log("❌ Geo error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000,
        distanceFilter: 0,
      }
    );
  };
  
  useEffect(() => {
    getCurrentLocation();
  }, []);

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

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    
    if (mapRef.current) {
      mapRef.current.getMapBoundaries().then((bounds) => {
        const currentZoom = {
          latitudeDelta: bounds.northEast.latitude - bounds.southWest.latitude,
          longitudeDelta: bounds.northEast.longitude - bounds.southWest.longitude,
        };
        
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

  const HandleClose = () => {
    setPermissionModal(false)
  }

  const HandleConfirm = async() => {
   setPermissionModal(false);
   await Linking.openSettings();
  }

  return (
    <>
      <View style={styles.sheetHeaderContainer}>
        <TouchableOpacity onPress={onClosePress}>
          <AntDesign name="right" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.bottomSheetHeaderText}>اضافة عنوان</Text>
        <View/>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          ref={mapRef}
          onPress={handleMapPress}
          pointerEvents={listOpen ? "none" : "auto"}
          scrollEnabled={!listOpen}
          pitchEnabled={!listOpen}
          rotateEnabled={!listOpen}
          zoomEnabled={!listOpen}
        >
          {marker && (
          <Marker 
            coordinate={marker} 
            onPress={() => {
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
        <TouchableOpacity onPress={getCurrentLocation} style={styles.currntLocationButton}>
        <Image source={require('../assets/images/location.png')} style={styles.locationImg} />
        </TouchableOpacity>
        <View style={styles.searchBarContainer} pointerEvents="box-none">
          <GooglePlacesAutocomplete
            ref={placesRef}
            listViewDisplayed={true}
            timeout={20000}
            onPress={(data, details = null) => {
              setListOpen(false); 
              const lat = details?.geometry?.location?.lat;
              const lng = details?.geometry?.location?.lng;
            
              if (!lat || !lng) return;
              setMarker({
                latitude: lat,
                longitude: lng,
              });
              mapRef.current?.animateToRegion(
                {
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                },
                800
              );
              setSelectedAddress({
                latitude: lat,
                longitude: lng,
                address: data.description,
                city: data.structured_formatting?.main_text ?? "",
              });
              getAddressFromCoordinates(lat, lng);
             
            }}
            predefinedPlaces={[]}
            textInputProps={{
              editable: true,
              clearButtonMode:'never',
              onFocus: () => setListOpen(true),  
              onBlur: () => setListOpen(false),
            }}
            placeholder="ابحث عن الموقع"
            minLength={2}
            fetchDetails={true}
            enablePoweredByContainer={false}
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
                zIndex: 99999,
                backgroundColor: '#fff',
                width: '100%',
                maxHeight: 300,
                elevation: 10,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              },
              row: {
                backgroundColor: '#fff',
                padding: 13,
                height: 44,
                flexDirection: 'row',
              },
              separator: {
                height: 0.5,
                backgroundColor: '#c8c7cc',
              },
            }}
            keyboardShouldPersistTaps="handled"
            suppressDefaultStyles={false}
          />
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
        <TouchableOpacity disabled={selectedAddress.address === '' && selectedAddress.city === ''} onPress={saveMapAddressButton} style={[styles.optButton,{
          backgroundColor:selectedAddress.address === '' && selectedAddress.city === '' ? '#bfbeba' : '#23a2a4'
        }]}>
          <Text style={styles.saveBtnText}>حفظ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={AddManuallyButton} style={styles.googleButton}>
          <Text style={[styles.saveBtnText, { color: '#000', fontFamily: CAIRO_FONT_FAMILY.regular }]}>
            او أختر المدينة والمنطقة <Text style={{ color: '#23a2a4', fontFamily: CAIRO_FONT_FAMILY.regular }}>مباشرة</Text></Text>
        </TouchableOpacity>
      </View>
      <CustomAlertModal
        visible={permissionModal}
        title={'Permission Required'}
        message={'Please enable location access in your phone settings to detect your current location.'}
        onClose={HandleClose}
        onConfirm={HandleConfirm}
        confirmText={'Open Setting'}
        type={'info'}
      />
    </>
  );
};
export default GoogleMapComponent;

const styles = StyleSheet.create({
  sheetHeaderContainer: {
    flexDirection: 'row',
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
    textAlign:'center'

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
    marginTop:10,
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
    zIndex:999
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
  currntLocationButton:{
    width:50,
    height:50,
    position:'absolute',
    borderRadius: 50/2,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    backgroundColor:'#36a6ad',
    alignItems:'center',
    zIndex:999,
    bottom:0,
    justifyContent:'center',
    margin:10
  },
  currentLocationText:{
    color:'#fff',
    fontSize:14,
    padding:10
  },
  locationImg:{
    width:20,
    height:20,
    resizeMode:'contain',
    tintColor:'#fff'
  }
})
