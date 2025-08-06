import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import FullScreenLoader from '../../components/FullScreenLoader';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import LocationMarkerIcon from '../../assets/icons/LocationMarkerIcon';
import { globalTextStyles } from '../../styles/globalStyles';
import { VisitLocationComponent } from '../../components/emailUpdateComponent';
import { bookingService } from '../../services/api/BookingService';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import GoogleMapComponent from '../../components/GoogleMapComponent';

const MyAddressesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.root.user.user);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false)
  const [bottomSheetHeight, setBottomSheetHeight] = useState("65%")
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [address, setAddress] = useState({
    latitude: 0,
    longitude: 0,
    address: 'الموقع غير محدد',
    city: '',
  });
  const [isGoogleMap, setIsGoogleMap] = useState(false)
  const [addressForm, setAddressForm] = useState({
    rigin: '',
    city: '',
    neighborhood: '',
    description: '',
  })

  useEffect(() => {
    getAddresses();
  }, []);

  useEffect(() => {
    if (openBottomSheet) {
      if (focusedField === 'description') {
        setBottomSheetHeight('87%');
      } else {
        setBottomSheetHeight('65%');
      }
    }
  }, [openBottomSheet, focusedField]);

  const getAddresses = async () => {
    setIsLoading(true);
    const payload = {
      "UserLogininfoId": user?.Id,
    }
    const response = await profileService.getUserAddresses(payload);
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setAddresses(response?.Result);
    }
    setIsLoading(false);
  }
  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('my_addresses')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const renderItem = ({ item }: any) => {
    return (
      <View
        style={[
          styles.savedAddressItem,
        ]}
      >
        <View style={styles.row}>
          <View style={{ alignItems:'flex-start',justifyContent:'flex-start'}}>
            <LocationMarkerIcon size={22} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[globalTextStyles.h6, {color: '#000'}]}>{item.TitleSlang}</Text>
            <Text style={[globalTextStyles.bodySmall, {color: '#000', marginBottom: 10, textAlign: 'left' }]}>{item.Address}</Text>
            <Text style={[globalTextStyles.bodySmall, {color: '#000', marginBottom: 10, textAlign: 'left' }]}>{item.Description}</Text>
          </View>
        </View>
      </View>
    )
  }

  const updateBeneficiaryField = (field: string, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  }

  const HandleSaveAddress = async () => {
   try {
    setIsLoading(true);
    const payload = {
      "Address": "",
      "CatCityId": addressForm.city,
      "CatAreaId": addressForm.rigin,
      "CatSquareId": addressForm.neighborhood,
      "Area": "",
      "Description": addressForm.description,
      "GoogleLocation": "",
      "UserLogininfoId": user.Id
    }
    const response = await bookingService.AddUserLocation(payload)
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      getAddresses();
    }
    setOpenBottomSheet(false);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }


  const HandleGoogleMap = () => {
    setIsGoogleMap(true)
  }

  const AddManuallyButton = () => {
    setIsGoogleMap(false)
  }

  const saveMapAddressButton = async() => {
    try {
      setIsLoading(true);
      const payload = {
        "Address": address.address || '',
        "CatCityId": addressForm.city || '',
        "CatAreaId": addressForm.rigin || '1',
        "CatSquareId": addressForm.neighborhood || '1',
        "Area": address.address || '',
        "Description": addressForm.description || '',
        "GoogleLocation": `${address.latitude},${address.longitude}` || '',
        "UserLogininfoId": user.Id
      }
      const response = await bookingService.AddUserLocation(payload)
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        setOpenBottomSheet(false);
        getAddresses();
      }
      setAddressForm({
        rigin: '',
        city: '',
        neighborhood: '',
        description: '',
      })
      setAddress({
        latitude: 0,
        longitude: 0,
        address: '',
        city: '',
      })
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Text style={[globalTextStyles.bodyLarge, { color: '#000', marginBottom: 10 }]}>عناوين الزيارات</Text>
        <Text style={[globalTextStyles.bodySmall, { fontWeight: '500', color: '#000', marginBottom: 10, textAlign: 'center' }]}>يمكنك إضافة وتسجيل أكثر من عنوان لاستخدامها فى عملية الحجز</Text>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.Id.toString()}
          style={{ width: '100%', }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={getAddresses} />}
          ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000' }]}>{t('no_addresses')}</Text>
          </View>}
        />
      </View>
      <TouchableOpacity onPress={() => setOpenBottomSheet(true)} style={{ height: 50, marginTop: 10, backgroundColor: '#23a2a4', marginHorizontal: 10, marginBottom: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[globalTextStyles.buttonMedium, { color: '#fff' }]}>{t('add_address')}</Text>
      </TouchableOpacity>
      <FullScreenLoader visible={isLoading} />

      <CustomBottomSheet
        visible={openBottomSheet}
        onClose={() => setOpenBottomSheet(false)}
        height={bottomSheetHeight}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalBackground}>
              <View style={[styles.modalContainer,{paddingBottom:isGoogleMap ? 50 : 20}]}>
                {
                  isGoogleMap ? (
                    <GoogleMapComponent
                      onClosePress={() => setOpenBottomSheet(false)}
                      setDescriptionValue={(text) => updateBeneficiaryField('description', text)}
                      descriptionValue={addressForm.description}
                      saveMapAddressButton={saveMapAddressButton}
                      AddManuallyButton={AddManuallyButton}
                      selectedAddress={address}
                      setSelectedAddress={setAddress}
                      marker={{latitude: address.latitude, longitude: address.longitude}}
                      setFocusedField={setFocusedField}
                      />
                  ) : (
         
                <VisitLocationComponent
                  onClosePress={() => setOpenBottomSheet(false)}
                  setRiginValue={(text) => updateBeneficiaryField('rigin', text)}
                  riginValue={addressForm.rigin}
                  setCityValue={(text) => updateBeneficiaryField('city', text)}
                  cityValue={addressForm.city}
                  setDescriptionValue={(text) => updateBeneficiaryField('description', text)}
                  descriptionValue={addressForm.description}
                  setNeighbearhoodValue={(text) => updateBeneficiaryField('neighborhood', text)}
                  neighbearhoodValue={addressForm.neighborhood}
                  saveAddressButton={HandleSaveAddress}
                  GoogleMapButton={HandleGoogleMap}
                  setFocusedField={setFocusedField}
                />
                  )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </CustomBottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...globalTextStyles.h3,
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  savedAddressItem: {
    borderRadius: 12,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    textAlign: 'left',
  },
  square: {
    fontSize: 15,
    color: '#222',
    textAlign: 'left',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#888',
    textAlign: 'left',
    marginTop: 2,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    paddingBottom: 20,
  },
})

export default MyAddressesScreen