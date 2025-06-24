import React, { useState } from 'react';
import { View, Button, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
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
import { addCardItem } from '../../shared/redux/reducers/bookingReducer';
import OrderSuccess from '../../components/bookingSteps/OrderSuccess';

const BookingScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const dispatch = useDispatch();
  const category = useSelector((state: any) => state.root.booking.category);
  const existingCardItems = useSelector((state: any) => state.root.booking.cardItems);
  const [SuccessResponse, setSuccessResponse] = useState(null);

  const onPressSpecialty = (specialty: any) => {
    console.log("specialty===>", specialty)
    if (specialty.Id == "105") {
      const cardItem = {
        ...specialty,
        "CatCategoryId": category.Id,
        "CatServiceId": specialty.Id,
        "CatCategoryTypeId": specialty.CatCategoryTypeId,
      }
      const tempCardItems = [...existingCardItems, cardItem];
      dispatch(addCardItem(tempCardItems));
    } else {
      const cardItem = {
        ...specialty,
        "CatCategoryId": category.Id,
        "CatSpecialtyId": specialty.Id,
        "CatCategoryTypeId": specialty.CatCategoryTypeId,
      }
      const tempCardItems = [...existingCardItems, cardItem];
      dispatch(addCardItem(tempCardItems));
    }
    setCurrentStep(2);
  }

  const onPressCheckoutOrder = (SuccessResponse: any) => {
    setSuccessResponse(SuccessResponse);
    setCurrentStep(5);
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Specialties onPressSpecialty={onPressSpecialty} />;
      case 2: return <DoctorListing onPressNext={() => setCurrentStep(3)} onPressBack={() => setCurrentStep(1)} />;
      case 3: return <ReviewOrder onPressNext={() => setCurrentStep(4)} onPressBack={() => setCurrentStep(2)} />;
      case 4: return <Payment onPressNext={onPressCheckoutOrder} onPressBack={() => setCurrentStep(3)} />;
      case 5: return <OrderSuccess SuccessResponse={SuccessResponse} />;
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
        <Stepper currentStep={currentStep} />
        <View style={styles.content}>
          {renderStep()}
        </View>
      </LinearGradient>
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
    fontSize: 20,
    fontWeight: 'bold',
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
  }
});

export default BookingScreen; 