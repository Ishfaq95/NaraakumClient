import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Modal } from 'react-native'
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

const MyAddressesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.root.user.user);
  console.log('user--',user);
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false)
  const [addressForm, setAddressForm] = useState({
    rigin: '',
    city: '',
    neighborhood: '',
    description: '',
  })

  useEffect(() => {
    getAddresses();
  }, []);

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
          <LocationMarkerIcon size={22} />
          <View style={styles.textContainer}>
            <Text style={[styles.title]}>{item.TitleSlang}</Text>
            <Text style={[styles.square]}>{item.SquareTitle}</Text>
            <Text style={[styles.description]}>{item.Description}</Text>
          </View>
        </View>
      </View>
    )
  }

  const updateBeneficiaryField = (field: string, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  }

  const HandleSaveAddress = async() => {
    const payload = {
      "Address": "",
      "CatCityId": addressForm.city,
      "CatAreaId": addressForm.rigin,
      "CatSquareId":"",
      "Area": "",
      "Description": addressForm.description,
      "GoogleLocation": "",
      "UserLogininfoId":user.Id
    }
    // const response = await bookingService.AddUserLocation(payload)
    // console.log('response',response);
    
  }


  const HandleGoogleMap = () => { }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', marginBottom: 10 }]}>عناوين الزيارات</Text>
        <Text style={[globalTextStyles.bodySmall, { fontWeight: '500', color: '#000', marginBottom: 10, textAlign: 'center' }]}>يمكنك إضافة وتسجيل أكثر من عنوان لاستخدامها فى عملية الحجز</Text>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.Id.toString()}
          style={{ width: '100%', }}
          ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000' }]}>{t('no_addresses')}</Text>
          </View>}
        />
      </View>
      <TouchableOpacity onPress={() => setOpenBottomSheet(true)} style={{ height: 50, marginTop: 10, backgroundColor: '#23a2a4', marginHorizontal: 10, marginBottom: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[globalTextStyles.buttonMedium, { color: '#fff' }]}>{t('add_address')}</Text>
      </TouchableOpacity>
      <FullScreenLoader visible={isLoading} />

      <Modal
        visible={openBottomSheet}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setOpenBottomSheet(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
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
            />



          </View>
        </View>
      </Modal>
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
    padding: 16,
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
    overflow: 'hidden'
  },
})

export default MyAddressesScreen