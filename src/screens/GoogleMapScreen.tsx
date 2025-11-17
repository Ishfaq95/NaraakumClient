import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { useNavigation } from '@react-navigation/native';

const GoogleMapScreen = ({route}:any) => {
  const navigation = useNavigation();
  const { onClose } = route.params || {};

  const [address, setAddress] = useState({
    latitude: 0,
    longitude: 0,
    address: '',
    city: '',
  });

  const [description, setDescription] = useState("");

  const handleSaveAddress = () => {
    if (route.params?.onClose) {
      route.params.onClose({
        mapAddress: address,
        description,
        fromSave: true,
        openSheet: false,
      });
    }
    navigation.goBack();
  };
  
  const handleClose = () => {
    if (route.params?.onClose) {
      route.params.onClose({ openSheet: true });
    }
    navigation.goBack();
  };
  
  
  
  

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <GoogleMapComponent
        onClosePress={handleClose}
        selectedAddress={address}
        setSelectedAddress={setAddress}

        descriptionValue={description}
        setDescriptionValue={setDescription}

        saveMapAddressButton={handleSaveAddress}
        AddManuallyButton={handleClose}

        marker={{ latitude: address.latitude, longitude: address.longitude }}
        setFocusedField={() => {}}
      />

    </SafeAreaView>
  );
};

export default GoogleMapScreen;
