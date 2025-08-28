import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, Modal, Image, SafeAreaView } from 'react-native';
import Stepper from '../../components/Stepper';
import DoctorListing from '../../components/bookingSteps/DoctorListing';
import ReviewOrder from '../../components/bookingSteps/ReviewOrder';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import Specialties from '../../components/bookingSteps/Specialties';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Payment from '../../components/bookingSteps/Payment';
import { addCardItem, clearCardItems, setSelectedUniqueId, setServices } from '../../shared/redux/reducers/bookingReducer';
import OrderSuccess from '../../components/bookingSteps/OrderSuccess';
import { generateUniqueId } from '../../shared/services/service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CheckIcon from '../../assets/icons/CheckIcon';
import FullScreenLoader from '../../components/FullScreenLoader';
import { bookingService } from '../../services/api/BookingService';
import { globalTextStyles } from '../../styles/globalStyles';

const BookingScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(route.params?.currentStep || 1);
  const dispatch = useDispatch();
  const category = useSelector((state: any) => state.root.booking.category);
  const services = useSelector((state: any) => state.root.booking.services);
  const existingCardItems = useSelector((state: any) => state.root.booking.cardItems);
  const [SuccessResponse, setSuccessResponse] = useState(null);
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [withNurse, setWithNurse] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);
  const steps = [1, 2, 3, 4];
  const onPressSpecialty = (specialty: any) => {
    if (category.Id == "32") {
      setSelectedSpecialty(specialty);
      setShowNurseModal(true);
    } else {
      if (specialty.CatLevelId == 3) {
        const cardItem = {
          ...specialty,
          "ItemUniqueId": generateUniqueId(),
          "CatCategoryId": category.Id,
          "CatServiceId": specialty.Id,
          "CatCategoryTypeId": category.CatCategoryTypeId,
        }
        const tempCardItems = [...existingCardItems, cardItem];
        dispatch(setServices(null));
        dispatch(setSelectedUniqueId(cardItem.ItemUniqueId));
        dispatch(addCardItem(tempCardItems));
      } else {
        const cardItem = {
          ...specialty,
          "ItemUniqueId": generateUniqueId(),
          "CatCategoryId": category.Id,
          "CatSpecialtyId": specialty.Id,
          "CatCategoryTypeId": category.CatCategoryTypeId,
        }
        const tempCardItems = [...existingCardItems, cardItem];
        const servicesArray = services.filter((item: any) => item.CatLevelId != 3);
        dispatch(setServices(servicesArray));
        dispatch(setSelectedUniqueId(cardItem.ItemUniqueId));
        dispatch(addCardItem(tempCardItems));
      }
      setCurrentStep(2);
    }

  }

  const onPressCheckoutOrder = (SuccessResponse: any) => {
    dispatch(clearCardItems());
    navigation.navigate("OrderSuccess", { SuccessResponse });
  }

  const onContinueWithService = (services: any) => {
    if (category.Id == "32") {
      setSelectedSpecialty(services)
      setShowNurseModal(true);
    } else {
      const uniqueId = generateUniqueId();
      let servicesArray: any[] = [];
      services.forEach((service: any) => {
        const cardItem = {
          "ItemUniqueId": uniqueId,
          "CatCategoryId": category.Id,
          "CatServiceId": service.Id,
          "CatCategoryTypeId": category.CatCategoryTypeId,
          "ServiceTitleSlang": service.TitleSlang,
        }
        servicesArray.push(cardItem);
      });

      const tempCardItems = [...existingCardItems, ...servicesArray];
      dispatch(setServices(null));
      dispatch(setSelectedUniqueId(uniqueId));
      dispatch(addCardItem(tempCardItems));
      setCurrentStep(2);
    }

  }

  const goWithNurse = () => {

    if (selectedSpecialty?.CatLevelId == 3) {
      const getServices = services.filter((service: any) => service.CatLevelId == 3);
      const getServicesWithNurse = getServices.filter((service: any) => service.iswithNurse == withNurse);

      const cardItem = {
        ...selectedSpecialty,
        "ItemUniqueId": generateUniqueId(),
        "CatCategoryId": category.Id,
        "CatServiceId": getServicesWithNurse[0].Id,
        "CatCategoryTypeId": category.CatCategoryTypeId,
      }
      const tempCardItems = [...existingCardItems, cardItem];
      dispatch(setServices(null));
      dispatch(setSelectedUniqueId(cardItem.ItemUniqueId));
      dispatch(addCardItem(tempCardItems));
    } else {
      const getServices = services.filter((service: any) => service.CatLevelId != 3);
      const getServicesWithNurse = getServices.filter((service: any) => service.iswithNurse == withNurse);

      const cardItem = {
        ...selectedSpecialty,
        "ItemUniqueId": generateUniqueId(),
        "CatCategoryId": category.Id,
        "CatSpecialtyId": selectedSpecialty.Id,
        "CatCategoryTypeId": category.CatCategoryTypeId,
      }
      const tempCardItems = [...existingCardItems, cardItem];
      dispatch(setServices(getServicesWithNurse));
      dispatch(setSelectedUniqueId(cardItem.ItemUniqueId));
      dispatch(addCardItem(tempCardItems));
    }

    setShowNurseModal(false);
    setCurrentStep(2);
  }

  // useEffect(() => {
  //   if(category.Id == "41"){
  //     getServices();
  //     setCurrentStep(2);
  //   }else{
  //     setCurrentStep(1);
  //   }
  // }, [category])

  const getServices = async () => {
    const offered = await bookingService.getOfferedServicesListByCategory({ abc: category?.Id, Search: '' });
    dispatch(setServices(offered?.OfferedServices));
  }

  if (currentStep == 0) {
    return (
      <FullScreenLoader visible={true} />
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Specialties onPressSpecialty={onPressSpecialty} onContinueWithService={onContinueWithService} />;
      case 2: return <DoctorListing onPressNext={() => setCurrentStep(3)} onPressBack={() => setCurrentStep(1)} />;
      case 3: return <ReviewOrder onPressNext={() => setCurrentStep(4)} onPressBack={() => setCurrentStep(2)} />;
      case 4: return <Payment onPressNext={onPressCheckoutOrder} onPressBack={() => setCurrentStep(3)} />;
      default: return null;
    }
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('booking')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(39,165,153,0.47)', '#54b196']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.515, y: 0.5 }}
        style={styles.container}
      >
        {renderHeader()}
        <Stepper currentStep={currentStep} steps={steps} />
        <View style={styles.content}>
          {renderStep()}
        </View>
      </LinearGradient>
      <Modal
        visible={showNurseModal}
        onRequestClose={() => setShowNurseModal(false)}
        transparent={true}
        animationType='fade'
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{"اختر مع الممرضة"}</Text>
              <TouchableOpacity onPress={() => setShowNurseModal(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            {/* Message and Button */}
            <View style={styles.modalContent}>
              <View style={styles.modalMessageContainer}>
                <View style={styles.imageContainer}>
                  <Image source={require('../../assets/images/nurse-icon.png')} style={styles.image} />
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setWithNurse(!withNurse)}>
                    <View style={[styles.checkbox, withNurse && styles.checkedBox]}>
                      {withNurse && <CheckIcon width={12} height={12} />}
                    </View>
                    <Text style={styles.rememberText}>{"مع ممرضة"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => goWithNurse()}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>يغلق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16
  },
  headerTitle: {
    ...globalTextStyles.h3,
    color: '#000',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f3f2',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2d3a3a',
  },
  closeIcon: {
    fontSize: 22,
    color: '#888',
  },
  modalContent: {
    padding: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: '#2d3a3a',
    marginBottom: 24,
    textAlign: 'left',
  },
  modalButton: {
    backgroundColor: '#27a6a1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#27a6a1',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'gray',
    borderRadius: 30,
    marginRight: 10,
  },
  image: {
    width: 40,
    height: 40,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#008080',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#008080',
  },
  rememberText: {
    fontSize: 12,
    color: '#666',
  },
});

export default BookingScreen; 