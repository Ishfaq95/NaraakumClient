import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, Alert } from 'react-native';
import Stepper from '../../components/Stepper';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import PackageListDetails from '../../components/HomeDialysisBookingSteps/PackageListDetails';
import DoctorListing from '../../components/HomeDialysisBookingSteps/DoctorListing';
import UploadFileStep from '../../components/HomeDialysisBookingSteps/UploadFileStep';
import AddMoreService from '../../components/HomeDialysisBookingSteps/AddMoreService';
import Header from '../../components/common/Header';
import FullScreenLoader from '../../components/FullScreenLoader';
import { bookingService } from '../../services/api/BookingService';
import { setServices } from '../../shared/redux/reducers/bookingReducer';
import moment, { Moment } from 'moment';
import { generateSlotsForDate } from '../../utils/timeUtils';
import { generatePayloadforOrderMainBeforePayment } from '../../shared/services/service';

const HomeDialysisBookingScreen = ({ selectedOrganization, SetInitialStep }: any) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const category = useSelector((state: any) => state.root.booking.category);
  const services = useSelector((state: any) => state.root.booking.services);
  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.homeDialysisCardItems);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [allAvailabilityData, setAllAvailabilityData] = useState<any[]>([]);
  const [ProviderWithSlots, setProviderWithSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const dispatch = useDispatch();

  console.log("selectedOrganization",selectedOrganization)

  useEffect(() => {
    if (serviceProviders.length > 0 && availability.length > 0) {
      getSlotsWithProvider()
    }
  }, [serviceProviders, availability])

  // Memoize filtered providers to prevent unnecessary re-renders
  const filteredProviders = useMemo(() => {
    return ProviderWithSlots.filter((item: any) => {
      const providerAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
      );

      if (providerAvailability.length > 0) {
        const dayOfWeek = new Date(selectedDate.format('YYYY-MM-DD')).toLocaleString("en-US", {
          weekday: "long",
        });

        const holidays = providerAvailability[0]?.ServiceProviderHolidays?.split(',');
        return !holidays?.includes(dayOfWeek);
      }
      return false;
    });
  }, [ProviderWithSlots, availability, selectedDate]);

  const getSlotsWithProvider = async () => {
    setSlotsLoaded(true)
    const tempProvider: any = []
    serviceProviders.map((provider: any) => {
      const providerAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.ServiceProviderId === provider.UserId)
      );

      const slotDuration = provider.SlotDuration || 30;
      const formattedDate = selectedDate.format('YYYY-MM-DD');

      if (providerAvailability.length > 0) {
        const DoctorAvailable: any = generateSlotsForDate(
          providerAvailability[0],
          formattedDate,
          slotDuration,
        );

        // Filter for available slots that are not in the past
        const filteredDoctorAvailable = DoctorAvailable.filter((item: any) => {
          if (!item.available) return false;
          
          // Only check past times if the selected date is today
          const today = new Date();
          const selectedDateObj = new Date(selectedDate.format('YYYY-MM-DD'));
          
          // If selected date is not today, all available slots are valid
          if (selectedDateObj.toDateString() !== today.toDateString()) {
            return true;
          }
          
          // For today, check if the time slot is in the future
          const now = new Date();
          const slotTime = new Date();
          const [inputHours, inputMinutes] = item.fullTime.split(':').map(Number);
          
          // Set the time of slot date to match the input
          slotTime.setHours(inputHours);
          slotTime.setMinutes(inputMinutes);
          slotTime.setSeconds(0);
          slotTime.setMilliseconds(0);
          
          return slotTime > now;
        })

        const tempDoctorObj = {
          ...provider,
          slots: filteredDoctorAvailable
        }

        tempProvider.push(tempDoctorObj)
      }
    })

    setSlotsLoaded(false)

    setProviderWithSlots(tempProvider)
  }

  const fetchServicesData = async () => {
    try {
      const offered = await bookingService.getOfferedServicesListByCategory({ abc: category?.Id, Search: '' });
      dispatch(setServices(offered?.OfferedServices));
    } catch (error) {
      console.error('Error fetching booking data:', error);
    }
  };

  useEffect(() => {
    if (category) {
      fetchServicesData()
    }
  }, [category]);

  useEffect(() => {
    fetchServiceProviders();
    fetchInitialAvailability();
  }, [category, services]);

  const getServiceIds = () => {
    return services
      .map((service: any) => service.Id)
      .join(',');
  };

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      let serviceIds = getServiceIds();

      let requestBody = {
        CatcategoryId: category.Id,
        ServiceIds: serviceIds,
        Search: '',
        PatientLocation: null,
        CatCityId: null,
        CatSquareId: null,
        Gender: 2,
        PageNumber: 0,
        PageSize: 100,
      }

      const response = await bookingService.getServiceProviderListByService(requestBody);

      setServiceProviders(response?.ServiceProviderList || []);
    } catch (error) {
      console.error('Error fetching service providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialAvailability = async (date?: any) => {
    try {
      setLoader2(true);
      let serviceIds = getServiceIds();

      const requestBody = {
        CatServiceId: serviceIds,
        CatSpecialtyId: 0,
        StartDate: date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        PageNumber: 1,
        PageSize: 20
      }

      const response = await bookingService.getServiceProviderSchedulingAvailability(requestBody);

      setAllAvailabilityData(response?.SchedulingAvailability || []);
      // Set initial availability for selected date
      filterAvailabilityForDate(date ? moment(date) : moment(), response?.SchedulingAvailability || []);
    } catch (error) {
      console.error('Error fetching initial availability:', error);
    } finally {
      setLoader2(false);
    }
  };

  const filterAvailabilityForDate = (date: Moment, data: any[]) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const filteredData = data.filter(item => item.Date === formattedDate);
    setAvailability(filteredData);
  };

  const createOrderMainBeforePayment = async () => {
    console.log("CardArray", CardArray)
    const payload = {
      "UserLoginInfoId": user.Id,
      "CatPlatformId": 1,
      "OrderDetail": generatePayloadforOrderMainBeforePayment(CardArray)
    }

    const response = await bookingService.createOrderMainBeforePayment(payload);

    console.log("response", response)

    if (response.ResponseStatus.STATUSCODE == 200) {
      return response;
    } else {
      Alert.alert(response.ResponseStatus.MESSAGE)
    }
  }

  console.log("currentStep", currentStep)

  const handleNextStep = async () => {
    if (currentStep == 2) {
      // const response = await createOrderMainBeforePayment()
      
        setCurrentStep(4)
      
    }else{
      setCurrentStep(currentStep + 1)
    }
  }

  const steps = [1, 2, 3];
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PackageListDetails selectedOrganization={selectedOrganization} onPressNext={() => setCurrentStep(2)} onPressBack={() => setCurrentStep(1)} />;
      case 2: return <DoctorListing filteredProviders={filteredProviders} selectedDate={selectedDate} availability={availability} onPressNext={() => setCurrentStep(3)} onPressBack={() => setCurrentStep(1)} />;
      case 3: return <UploadFileStep onPressNext={() => setCurrentStep(4)} onPressBack={() => setCurrentStep(2)} />;
      case 4: return <AddMoreService onPressNext={() => { }} onPressBack={() => setCurrentStep(3)} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.515, y: 0.5 }}
        style={styles.container}
      >
        <View style={{ paddingHorizontal: 16, alignItems: 'center', paddingTop: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>{"غسيل الكلى المنزلي"}</Text>
        </View>
        <Stepper currentStep={currentStep} steps={steps} />
        <View style={styles.content}>
          {renderStep()}
        </View>
        {/* Sticky Bottom Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#f0f0f0' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '48%' }}>
            {currentStep > 1 && <TouchableOpacity onPress={() => currentStep != 2 ? setCurrentStep(currentStep - 1) : SetInitialStep()} style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '48%' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>السابق</Text>
            </TouchableOpacity>}
            <TouchableOpacity style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '48%' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}> الغاء الامر</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity onPress={() => { handleNextStep()}} disabled={currentStep == 2 && CardArray.length == 0} style={{ backgroundColor: (currentStep == 2 && CardArray.length == 0) ? '#ccc' : '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '30%' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>التالي</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, backgroundColor: '#eceff4', padding: 16, borderRadius: 16 },
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

export default HomeDialysisBookingScreen; 