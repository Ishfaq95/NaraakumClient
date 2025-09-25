import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Image, ScrollView, Dimensions, I18nManager, Alert, Modal, SafeAreaView } from 'react-native';
import moment, { Moment } from 'moment';
import 'moment-hijri';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import FilterIcon from '../../assets/icons/FilterIcon';
import SearchInput from '../common/SearchInput';
import { useDispatch, useSelector } from 'react-redux';
import { bookingService, categoriesList } from '../../services/api/BookingService';
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../shared/utils/constants';
import LeftArrow from '../../assets/icons/LeftArrow';
import RightArrow from '../../assets/icons/RightArrow';
import ServiceProviderCard from './ServiceProviderCard';
import { convertUTCToLocalDateTime, generateSlots, generateSlotsForDate, getUniqueAvailableSlots } from '../../utils/timeUtils';
import FullScreenLoader from "../FullScreenLoader";
import { useTranslation } from 'react-i18next';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { generatePayloadforOrderMainBeforePayment } from '../../shared/services/service';
import { setApiResponse, prependCardItems, addCardItem } from '../../shared/redux/reducers/bookingReducer';
import { store } from '../../shared/redux/store';
import HospitalCard from './HospitalCard';
import HomeDialysis from './HomeDialysis';
import CustomBottomSheet from '../common/CustomBottomSheet';
import HomeDialysisBookingScreen from '../../screens/Booking/HomeDialysisBookingScreen';
import Dropdown from '../common/Dropdown';
import RadioButton from './RadioButton';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import BottomSheet from '@gorhom/bottom-sheet';

const CARD_MARGIN = 2;
const MIN_CARD_WIDTH = 48;
const MAX_CARD_WIDTH = 60;
const SortBy = [
  { label: 'ترتيب حسب السعر', value: 'All' },
  { label: 'الأعلى إلى الإقل', value: 'Desc' },
  { label: 'الأقل إلى الأعلى', value: 'Asc' },
];
const { width: deviceWidth } = Dimensions.get('window');
const minItemWidth = 60;
const numVisibleItems = 8; // 7 days + 1 calendar icon
const totalMargin = CARD_MARGIN * 2 * numVisibleItems;
const calculatedItemWidth = (deviceWidth - totalMargin) / numVisibleItems;
const itemWidth = calculatedItemWidth < minItemWidth ? minItemWidth : calculatedItemWidth;
const listWidth = itemWidth * numVisibleItems + totalMargin;
const isScrollable = calculatedItemWidth < minItemWidth;

interface DayItem {
  day: string;
  date: string;
  fullDate?: Moment;
  isHijri?: boolean;
  hijriDate?: string;
  hijriMonth?: string;
  icon?: boolean;
}

interface Specialty {
  CatSpecialtyId: string;
  TitlePlang: string;
  TitleSlang: string;
  UserloginInfoId: string;
  CatLevelId: number;
  LevelTitlePlang: string;
  LevelTitleSlang: string;
}

interface ServiceProvider {
  RowId: string;
  ServiceIds: string;
  Prices: string;
  PriceswithTax: string;
  OrganizationId: string;
  OrganizationTitlePlang: string;
  OrganizationTitleSlang: string;
  OrgImagePath: string | null;
  UserId: string;
  FullnamePlang: string;
  FullnameSlang: string;
  CellNumber: string;
  Email: string;
  Gender: boolean;
  ImagePath: string | null;
  AboutPlang: string;
  AboutSlang: string;
  YearsofExperience: string;
  AccumulativeRatingNum: number;
  AccumulativeRatingAvg: number;
  SlotDuration: number;
  Specialties: Specialty[];
  ServiceServe: any[];
  slots?: string[]; // Added for slot array support
}

interface Availability {
  UserId: string;
  Date: string;
  TimeSlots: string[];
  // Add other availability fields as needed
}

const ARABIC_DAYS = {
  Sunday: 'الأحد',
  Monday: 'الاثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
};

const TIME_SLOTS = [
  { label: '09:00 ص', value: '09:00' },
  { label: '10:00 ص', value: '10:00' },
  { label: '11:00 ص', value: '11:00' },
  { label: '12:00 م', value: '12:00' },
  { label: '01:00 م', value: '13:00' },
  { label: '02:00 م', value: '14:00' },
  { label: '03:00 م', value: '15:00' },
  { label: '04:00 م', value: '16:00' },
];

const DoctorListing = ({ onPressNext, onPressBack }: any) => {
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [days, setDays] = useState<DayItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [allAvailabilityData, setAllAvailabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [changeDateLoader, setChangeDateLoader] = useState(false);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const user = useSelector((state: any) => state.root.user.user);
  const services = useSelector((state: any) => state.root.booking.services);
  const category = useSelector((state: any) => state.root.booking.category);
  const selectedUniqueId = useSelector((state: any) => state.root.booking.selectedUniqueId);
  const scrollViewRef = useRef<ScrollView>(null);
  const { i18n } = useTranslation();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [ProviderWithSlots, setProviderWithSlots] = useState<any[]>([]);
  const [HospitalWithSlots, setHospitalWithSlots] = useState<any[]>([]);
  const isRTL = I18nManager.isRTL;
  const currentLang = i18n.language;
  const [customDateSelected, setCustomDateSelected] = useState(false);
  const [changedSelectedDate, setChangedSelectedDate] = useState(moment());
  const [isFlatListReady, setIsFlatListReady] = useState(false);
  const { t } = useTranslation();
  const SelectedCardItem = CardArray.filter((item: any) => item.ItemUniqueId === selectedUniqueId);
  const [hospitalList, setHospitalList] = useState<any[]>([]);
  const [organizationList, setOrganizationList] = useState<any[]>([]);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<any>(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [displayCategory, setDisplayCategory] = useState<any>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [showPackageList, setShowPackageList] = useState(false);
  const [isHomeDialysisBooking, setIsHomeDialysisBooking] = useState(false);
  const [filterBottomSheetVisible, setFilterBottomSheetVisible] = useState(false);
  const [selectServiceFilter, setSelectServiceFilter] = useState('All');
  const [selectSpecialtyFilter, setSelectSpecialtyFilter] = useState('AllType');
  const [sortByValue, setSortByValue] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const createOrderMainBeforePayment = async () => {

    const payload = {
      "UserLoginInfoId": user.Id,
      "CatPlatformId": 1,
      "OrderDetail": generatePayloadforOrderMainBeforePayment(CardArray)
    }

    const response = await bookingService.createOrderMainBeforePayment(payload);

    if (response.ResponseStatus.STATUSCODE == 200) {
      dispatch(setApiResponse(response.Data))
      onPressNext();
    } else {
      Alert.alert(response.ResponseStatus.MESSAGE)
    }
  }

  // useEffect(() => {
  //   const getUnPaidUserOrders = async () => {
  //     try {
  //       const response = await bookingService.getUnPaidUserOrders({ UserLoginInfoId: user.Id });

  //       if (response.Cart && response.Cart.length > 0) {
  //         // Convert API response to cardItems format
  //         const convertedCardItems = response.Cart;
  //         // Check for existing items and replace duplicates instead of adding
  //         const existingCardItems = CardArray;
  //         const updatedCardItems = [...existingCardItems];

  //         convertedCardItems.forEach((newItem: any) => {
  //           // Find if item already exists by OrderDetailId and OrderId
  //           const existingIndex = updatedCardItems.findIndex((existingItem: any) =>
  //             existingItem.OrderDetailId === newItem.OrderDetailId &&
  //             existingItem.OrderId === newItem.OrderId
  //           );

  //           if (existingIndex !== -1) {
  //             // Replace existing item with new one
  //             const startTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingTime);
  //             const endTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingEndTime);
  //             newItem.SchedulingTime = startTime.localTime;
  //             newItem.SchedulingEndTime = endTime.localTime;
  //             updatedCardItems[existingIndex] = newItem;
  //           } else {
  //             // Add new item if it doesn't exist
  //             const startTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingTime);
  //             const endTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingEndTime);
  //             newItem.SchedulingTime = startTime.localTime;
  //             newItem.SchedulingEndTime = endTime.localTime;
  //             updatedCardItems.push(newItem);
  //           }
  //         });

  //         // Dispatch the updated array
  //         dispatch(addCardItem(updatedCardItems));
  //       }
  //     } catch (error) {
  //       console.error('Error fetching unpaid orders:', error);
  //     }
  //   }
  //   getUnPaidUserOrders();
  // }, [user]);

  useEffect(() => {
    if (serviceProviders.length > 0 && availability.length > 0) {
      getSlotsWithProvider()
    }
  }, [serviceProviders, availability])

  function mergeAvailabilityArrays(...arrays: any[]) {
    const mergedMap = new Map();

    // Process all arrays
    arrays.forEach(array => {
      if (!Array.isArray(array)) {
        console.warn('Skipping non-array input:', array);
        return;
      }

      array.forEach(item => {
        if (!item || typeof item !== 'object') {
          console.warn('Skipping invalid item:', item);
          return;
        }

        // Use fullTime as unique identifier for each time slot
        const key = item.fullTime;

        if (!key) {
          console.warn('Skipping item without fullTime:', item);
          return;
        }

        const existingItem = mergedMap.get(key);

        if (!existingItem) {
          // First occurrence of this time slot
          mergedMap.set(key, { ...item });
        } else if (item.available === true && existingItem.available === false) {
          // Replace if new item is available and existing is not
          mergedMap.set(key, { ...item });
        }
        // If existing item is already available=true, keep it
        // If both are false or both are true, keep the existing one
      });
    });

    // Convert map back to array and sort by fullTime
    return Array.from(mergedMap.values()).sort((a, b) => {
      return a.fullTime.localeCompare(b.fullTime);
    });
  }

  const getSlotsWithProvider = async () => {
    setSlotsLoaded(true)
    const tempProvider: any = []
    serviceProviders.map((provider: any) => {
      const providerAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.ServiceProviderId === provider.UserId)
      );

      const slotDuration = provider.SlotDuration || 30;
      const formattedDate = selectedDate.locale('en').format('YYYY-MM-DD');

      if (providerAvailability.length > 0) {

        const DoctorAvailableArray: any = []
        providerAvailability.map((item: any) => {
          const DoctorAvailablelocal: any = generateSlotsForDate(
            item,
            formattedDate,
            slotDuration,
          );
          DoctorAvailableArray.push(DoctorAvailablelocal)
        })

        const DoctorAvailable: any = DoctorAvailableArray.length > 1 ? mergeAvailabilityArrays(...DoctorAvailableArray) : DoctorAvailableArray[0]


        // const DoctorAvailable: any = generateSlotsForDate(
        //   providerAvailability[0],
        //   formattedDate,
        //   slotDuration,
        // );

        const tempDoctorObj = {
          ...provider,
          slots: DoctorAvailable
        }

        tempProvider.push(tempDoctorObj)
      }
    })

    setSlotsLoaded(false)

    setProviderWithSlots(tempProvider)
  }

  useEffect(() => {
    if (hospitalList.length > 0 && availability.length > 0) {
      getSlotsWithHospital()
    }
  }, [hospitalList, availability])

  const getSlotsWithHospital = async () => {
    setSlotsLoaded(true)
    const tempHospital: any = []
    hospitalList.map((hospital: any) => {
      const hospitalAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.OrganizationId === hospital.OrganizationId)
      );

      const slotDuration = hospital.SlotDuration || 30;
      const formattedDate = selectedDate.locale('en').format('YYYY-MM-DD');

      if (hospitalAvailability.length > 0) {
        const HospitalAvailable: any = generateSlotsForDate(
          hospitalAvailability[0],
          formattedDate,
          slotDuration,
        );

        const tempHospitalObj = {
          ...hospital,
          slots: HospitalAvailable
        }
        tempHospital.push(tempHospitalObj)
      }
    })

    setSlotsLoaded(false)

    setHospitalWithSlots(tempHospital)
  }

  const getServiceIds = () => {
    return services
      .map((service: any) => service.Id)
      .join(',');
  };

  useEffect(() => {

    fetchData();
    generateDays();
  }, [category, services]);

  const fetchData = async () => {
    setRefreshing(true);
    const displayCategory = categoriesList.find((item: any) => item.Id == category.Id);
    setDisplayCategory(displayCategory);
    // Call both APIs when component mounts
    if (displayCategory?.Display == "CP") {
      fetchServiceProviders();
      fetchInitialAvailability();
    } else {
      if (category.Id == "41") {
        getOrganizationByPackage();
      } else {
        fetchHospitalListByServices();
        fetchOrganizationSchedulingAvailability();
      }
    }
    setRefreshing(false);
  }

  const getOrganizationByPackage = async () => {
    const payload = {
      "Search": "",
      "CatCityId": null,
      "PatientLocation": null,
      "CatSquareId": null,
      "PageNumber": 0,
      "PageSize": 10
    }
    const response = await bookingService.getOrganizationByPackage(payload);

    setOrganizationList(response?.OrganizationList || []);
  }

  const fetchHospitalListByServices = async () => {
    try {
      setLoading(true);
    const payload = {
      CatcategoryId: category.Id,
      ServiceIds: SelectedCardItem?.map((service: any) => service.CatServiceId).join(','),
      Search: "",
      PatientLocation: null,
      CatCityId: null,
      CatSquareId: null,
      PageNumber: 0,
      PageSize: 100
    }

    const response = await bookingService.getHospitalListByServices(payload);

    setHospitalList(response?.HospitalList || []);
    } catch (error) {
      console.error('Error fetching hospital list by services:', error);
    } finally {
      setLoading(false);
    }
  }

  const fetchOrganizationSchedulingAvailability = async (date?: any) => {
    try {
      setLoader2(true);
      const payload = {
        CatCategoryId: category.Id,
        StartDate: moment().locale('en').format('YYYY-MM-DD'),
        PageNumber: 1,
        PageSize: 15
      }
      const response = await bookingService.getOrganizationSchedulingAvailability(payload);
      setAllAvailabilityData(response?.SchedulingAvailability || []);
      // Set initial availability for selected date
      filterAvailabilityForDate(date ? moment(date) : moment(), response?.SchedulingAvailability || []);
    } catch (error) {
      console.error('Error fetching organization scheduling availability:', error);
    } finally {
      setLoader2(false);
    }
   
  }

  const getServiceIdsFromCardArray = () => {
    const serviceIds = SelectedCardItem.map((item: any) => item.CatServiceId);
    return serviceIds.join(',');
  }

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      let serviceIds = "";
      if (services == null) {
        serviceIds = getServiceIdsFromCardArray();
      } else {
        serviceIds = getServiceIds();
      }

      let requestBody: any = {};
      if (category.Id == "42" || category.Id == "32") {
        if (SelectedCardItem[0]?.CatLevelId == 3) {
          requestBody = {
            CatcategoryId: category.Id,
            ServiceIds: serviceIds,
            Search: searchQuery,
            PatientLocation: null,
            CatCityId: null,
            CatSquareId: null,
            Gender: 2,
            PageNumber: 0,
            PageSize: 100,
          }
        } else {
          requestBody = {
            CatcategoryId: category.Id,
            ServiceIds: serviceIds,
            Search: searchQuery,
            PatientLocation: null,
            CatCityId: null,
            CatSquareId: null,
            Gender: 2,
            PageNumber: 0,
            PageSize: 100,
            SpecialtyIds: SelectedCardItem[0]?.CatSpecialtyId || 0
          }
        }
      } else {
        requestBody = {
          CatcategoryId: category.Id,
          ServiceIds: serviceIds,
          Search: searchQuery,
          PatientLocation: null,
          CatCityId: null,
          CatSquareId: null,
          Gender: 2,
          PageNumber: 0,
          PageSize: 100,
        }
      }

      const response = await bookingService.getServiceProviderListByServiceByIds(requestBody);

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
      let serviceIds = "";
      if (services == null) {
        serviceIds = getServiceIdsFromCardArray();
      } else {
        serviceIds = getServiceIds();
      }

      console.log("SelectedCardItem",SelectedCardItem)

      const requestBody = {
        CatServiceId: serviceIds,
        CatSpecialtyId: SelectedCardItem[0]?.CatSpecialtyId || 0,
        StartDate: date ? moment(date).locale('en').format('YYYY-MM-DD') : moment().locale('en').format('YYYY-MM-DD'),
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
    const formattedDate = date.locale('en').format('YYYY-MM-DD');
    const filteredData = data.filter(item => item.Date === formattedDate);
    setAvailability(filteredData);
  };

  const generateDays = (startDate?: moment.Moment) => {
    const baseDate = startDate ? moment(startDate).locale('en') : moment().locale('en');
    const daysArray: DayItem[] = [];

    // Generate 7 days starting from the given base date
    for (let i = 0; i < 7; i++) {
      const currentDate = moment(baseDate).locale('en').add(i, 'days');
      const englishDay = currentDate.format('dddd');
      const hijriDate = currentDate.format('iD').replace('i', '');

      daysArray.push({
        day: ARABIC_DAYS[englishDay as keyof typeof ARABIC_DAYS],
        date: currentDate.format('D'),
        fullDate: currentDate,
        isHijri: true,
        hijriDate: hijriDate,
        hijriMonth: currentDate.format('iM').replace('i', ''),
      });
    }

    // Add calendar icon as the 8th item
    daysArray.push({ day: '', date: '', icon: true });
    setChangeDateLoader(false)
    setDays(daysArray);
  };

  const handleDateSelect = (date: Moment) => {
    setChangeDateLoader(true)
    setSelectedDate(date);
    // Clear selected slot when date changes
    setSelectedSlotInfo(null);

    const baseDate = changedSelectedDate
      ? moment(changedSelectedDate).local().startOf('day')  // Force local timezone
      : moment().locale('en').startOf('day');

    const isWithinSevenDays = moment(date).local().isBetween(
      baseDate,
      moment(baseDate).locale('en').add(6, 'days').endOf('day'),
      'day',
      '[]'
    );


    if (isWithinSevenDays) {
      setChangeDateLoader(false)
      filterAvailabilityForDate(date, allAvailabilityData);
    } else {
      setChangedSelectedDate(date)
      const formattedDate = date.locale('en').format('YYYY-MM-DD');
      generateDays(moment(formattedDate));
      fetchInitialAvailability(moment(formattedDate));
    }
  };

  const handleCalendarPress = () => {
    setCalendarVisible(true);
  };

  const handleCalendarConfirm = (date: Date) => {
    setCalendarVisible(false);
    handleDateSelect(moment(date));
  };

  const handleCalendarCancel = () => {
    setCalendarVisible(false);
  };

  const handleNext = useCallback(() => {
    if (displayCategory?.Display == "CP") {
      const serviceId = SelectedCardItem[0]?.CatServiceId;
      if (!serviceId) {
        setShowServiceModal(true);
      } else {
        createOrderMainBeforePayment();
      }
    } else {
      createOrderMainBeforePayment();
    }

  }, [CardArray, createOrderMainBeforePayment]);

  const handleBack = () => {
    onPressBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchServiceProviders(); // Refetch with new search query
  };

  const handleFilterPress = () => {
    setFilterBottomSheetVisible(true)
  };

  const handleSelectSlot = useCallback((provider: any, slot: any) => {
    console.log("SelectedCardItem",SelectedCardItem)
    const serviceId = SelectedCardItem[0]?.CatServiceId
    if (serviceId == 0 || serviceId == null || serviceId == "" || serviceId == undefined) {
      setShowServiceModal(true)
    }
    // If the same slot is already selected, deselect it
    if (selectedSlotInfo?.providerId === provider.UserId && selectedSlotInfo?.slotTime === slot.start_time) {
      setSelectedSlotInfo(null);
    } else {
      // Select the new slot (this will automatically deselect the previous one)
      setSelectedSlotInfo({
        providerId: provider.UserId,
        slotTime: slot.start_time
      });
    }
  }, [selectedSlotInfo, CardArray]);

  const handleSelectHospitalSlot = (hospital: any, slot: any) => {
    if (selectedSlotInfo?.OrganizationId === hospital.OrganizationId && selectedSlotInfo?.slotTime === slot.start_time) {
      setSelectedSlotInfo(null);
    } else {
      // Select the new slot (this will automatically deselect the previous one)
      setSelectedSlotInfo({
        OrganizationId: hospital.OrganizationId,
        slotTime: slot.start_time
      });
    }
  }

  console.log("availability", availability)

  // Memoize filtered providers to prevent unnecessary re-renders
  const filteredProviders = useMemo(() => {
    return ProviderWithSlots.filter((item: any) => {
      const providerAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
      );

      if (providerAvailability.length > 0) {
        const dayOfWeek = new Date(selectedDate.locale('en').format('YYYY-MM-DD')).toLocaleString("en-US", {
          weekday: "long",
        });

        const holidays = providerAvailability[0]?.ServiceProviderHolidays?.split(',');
        return !holidays?.includes(dayOfWeek);
      }
      return false;
    });
  }, [ProviderWithSlots, availability, selectedDate]);

  // Memoize filtered providers to prevent unnecessary re-renders
  const filteredHospitals = useMemo(() => {
    return HospitalWithSlots.filter((item: any) => {
      const hospitalAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.OrganizationId === item.OrganizationId)
      );

      if (hospitalAvailability.length > 0) {
        const dayOfWeek = new Date(selectedDate.locale('en').format('YYYY-MM-DD')).toLocaleString("en-US", {
          weekday: "long",
        });

        const holidays = hospitalAvailability[0]?.ServiceProviderHolidays?.split(',');
        return !holidays?.includes(dayOfWeek);
      }
      return false;
    });
  }, [HospitalWithSlots, availability, selectedDate]);

  const handleSelectService = (providerId: string, service: string) => {
    const obj: any = {
      selectedService: service,
      providerId: providerId,
    }

    setSelectedService(obj)
  }

  const handleSelectOrganization = (organization: any) => {
    setSelectedOrganization(organization)
    setIsBottomSheetVisible(true)
  }

  const continueFromHomeDialysisBooking = () => {
    setIsHomeDialysisBooking(false)
    setIsBottomSheetVisible(false)

    onPressNext()
  }

  const closeBottomSheetHomeDialysisBooking = () => {
    setIsBottomSheetVisible(false)
    setIsHomeDialysisBooking(false)
  }

  const handleStepsForHomeDialysisBooking = () => {
    setIsHomeDialysisBooking(true)
    setTimeout(() => {
      setIsHomeDialysisBooking(false)
    }, 100);
  }

  const handleApplyFilterPress = () => {
  }

  const getNextButtonEnabled = useCallback(() => {
    if (displayCategory?.Display == "CP") {
      return SelectedCardItem[0]?.CatServiceId == 0 || SelectedCardItem[0]?.CatServiceId == null || SelectedCardItem[0]?.CatServiceId == "" || SelectedCardItem[0]?.CatServiceId == undefined || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == 0 || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == null || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == "" || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == undefined
    } else {
      return SelectedCardItem[0]?.OrganizationId == null || SelectedCardItem[0]?.OrganizationId == "" || SelectedCardItem[0]?.OrganizationId == undefined
    }
  }, [selectedSlotInfo, CardArray,SelectedCardItem])

  const convertArabicTimeTo24Hour = (timeString: string): string => {
    if (!timeString) return timeString;

    // Remove any extra spaces and split by space
    const parts = timeString.trim().split(' ');
    if (parts.length < 2) {
      return timeString; // If no AM/PM indicator, return as is
    }

    const timePart = parts[0]; // e.g., "2:30"
    const periodPart = parts[1]; // e.g., "ص" (ص for AM) or "م" (م for PM)

    // Split time into hours and minutes
    const [hours, minutes] = timePart.split(':').map(Number);

    let hour24 = hours;

    // Convert based on Arabic period indicators
    // ص = صباح (morning/AM)
    // م = مساء (evening/PM)
    if (periodPart === 'ص') {
      // AM - keep as is, but handle 12 AM case
      if (hours === 12) {
        hour24 = 0;
      }
    } else if (periodPart === 'م') {
      // PM - add 12 hours, but handle 12 PM case
      if (hours !== 12) {
        hour24 = hours + 12;
      }
    } else {
    }

    const result = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return result;
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <FlatList
          data={days}
          horizontal
          showsHorizontalScrollIndicator={isScrollable}
          keyExtractor={(item) => item.icon ? 'calendar-icon' : item.fullDate?.format('YYYY-MM-DD') || ''}
          contentContainerStyle={[styles.list, { width: isScrollable ? listWidth : '100%' }]}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => item.icon ? handleCalendarPress() : item.fullDate && handleDateSelect(item.fullDate)}
              style={[
                styles.card,
                {
                  width: itemWidth,
                  backgroundColor: item.fullDate && selectedDate.isSame(item.fullDate, 'day') ? '#179c8e' : '#f7f7f7',
                },
              ]}
            >
              {item.icon ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: itemWidth }}>
                  <CalendarIcon width={24} height={24} color="#179c8e" />
                </View>
              ) : (
                <>
                  <Text style={[styles.date, item.fullDate && selectedDate.isSame(item.fullDate, 'day') ? { color: '#fff' } : { color: '#000' }]}>
                    {item.hijriDate}
                  </Text>
                  <Text style={[styles.day, item.fullDate && selectedDate.isSame(item.fullDate, 'day') ? { color: '#fff' } : { color: '#000' }]}>
                    {item.day}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        />
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <SearchInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="ابحث عن..."
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
            <FilterIcon width={20} height={20} color="#179c8e" />
            <Text style={styles.filterButtonText}>تطبيق الفلتر</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row',  paddingHorizontal: 16, paddingTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ ...globalTextStyles.bodyLarge, fontWeight: '600', color: '#36454f' }}>
          {`النتائج (${filteredProviders.length || organizationList.length || filteredHospitals.length})`}
        </Text>
      </View>
      {/* Service Providers List */}
      {/* {displayCategory?.Display == "CP" ? serviceProviders.length > 0 : hospitalList.length > 0 &&  */}
      <View style={{ flex: 1, paddingBottom: 50, }}>
        {
          displayCategory?.Display == "CP" ? 
          <FlatList
            data={filteredProviders}
            keyExtractor={(item) => item.RowId}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            initialNumToRender={3}
            ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ ...globalTextStyles.bodyLarge, color: '#dc3545' }}>
                لا يوجد نتائج
              </Text>
            </View>}
            onRefresh={fetchData}
            refreshing={refreshing}
            renderItem={({ item, index }) => {
              const providerAvailability = availability.flatMap(avail =>
                avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
              );

              const allAvailableSlots = item.slots?.filter((s: any) => {
                // Check if slot is available
                if (!s.available) return false;
                
                // Check if start time is not in the past
                const currentDate = new Date();
                const slotDate = new Date(s.date);
                const slotTime = s.start_time;
                
                // Parse the time (assuming format like "12:00 ص" or "08:00 ص")
                const timeMatch = slotTime.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
                if (!timeMatch) return false;
                
                let hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const period = timeMatch[3];
                
                // Convert to 24-hour format
                if (period === 'م' && hours !== 12) {
                  hours += 12;
                } else if (period === 'ص' && hours === 12) {
                  hours = 0;
                }
                
                // Create slot datetime
                const slotDateTime = new Date(slotDate);
                slotDateTime.setHours(hours, minutes, 0, 0);
                
                // Check if slot time is in the future
                return slotDateTime > currentDate;
              });

              if(allAvailableSlots.length == 0) {
                return null
              }

              return <ServiceProviderCard
                provider={item}
                selectedDate={selectedDate}
                availability={providerAvailability[0]}
                selectedSlotInfo={selectedSlotInfo}
                onSelectSlot={handleSelectSlot}
                onSelectService={handleSelectService}
                selectedService={selectedService}
              />
            }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
            : category.Id == "41" ? 
            <FlatList
              data={organizationList}
              keyExtractor={(item) => item.OrganizationId}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={3}
              onRefresh={fetchData}
              refreshing={refreshing}
              renderItem={({ item, index }) => {
                return <HomeDialysis hospital={item} onPressContinue={() => handleSelectOrganization(item)} onPressPackageList={() => {
                  setShowPackageList(true)
                  handleSelectOrganization(item)
                }} />
              }}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            /> :
              <FlatList
                data={filteredHospitals}
                keyExtractor={(item) => item.UserId}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                onRefresh={fetchData}
                refreshing={refreshing}
                windowSize={10}
                initialNumToRender={3}
                renderItem={({ item, index }) => {
                  const providerAvailability = availability.flatMap(avail =>
                    avail.Detail.filter((detail: any) => detail.OrganizationId === item.OrganizationId)
                  );

                  return <HospitalCard
                    hospital={item}
                    selectedDate={selectedDate}
                    availability={providerAvailability[0]}
                    selectedSlotInfo={selectedSlotInfo}
                    onSelectSlot={handleSelectHospitalSlot}
                    selectedService={selectedService}
                  />
                }}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              />
        }
      </View>
      {/* } */}
      <View style={styles.BottomContainer}>
        {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.nextButton, getNextButtonEnabled() ? styles.disabledNextButton : {}]}
          onPress={handleNext}
          disabled={getNextButtonEnabled()}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>

      <FullScreenLoader visible={loading || loader2 || slotsLoaded || changeDateLoader} />
      <DateTimePickerModal
        isVisible={isCalendarVisible}
        mode="date"
        onConfirm={handleCalendarConfirm}
        onCancel={handleCalendarCancel}
        locale={currentLang === 'ar' ? 'ar-SA' : 'en'}
        minimumDate={new Date()}
        maximumDate={moment().add(30, 'days').toDate()}
        display="default"
      />
      <Modal
        visible={showServiceModal}
        onRequestClose={() => setShowServiceModal(false)}
        transparent={true}
        animationType='fade'
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تحذير</Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            {/* Message and Button */}
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>يرجى اختيار خدمة واحدة</Text>
              <TouchableOpacity
                onPress={() => setShowServiceModal(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>يغلق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomBottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        style={{ paddingHorizontal: 16 }}
        height="80%"
      >
        {
          showPackageList ?
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              {/* Sticky Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 8,
                borderBottomWidth: 1,
                borderColor: '#f0f0f0',
                backgroundColor: '#fff',
                zIndex: 2,
              }}>
                <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)}>
                  <Text style={{ fontSize: 24, color: '#222' }}>×</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222', textAlign: 'center', flex: 1 }}>
                  باقات غسيل الكلى المنزلي
                </Text>
                <View style={{ width: 28 }} />
              </View>

              {/* Sub-header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f7fafd',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 16,
                margin: 12,
                marginBottom: 0,
              }}>
                <Text style={{ fontSize: 16, color: '#222', fontWeight: 'bold' }}>مركز عبر الطبي</Text>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f7f7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                  {/* Replace with your WhatsApp icon if available */}
                  <Text style={{ color: '#239ea0', fontWeight: 'bold', fontSize: 18, marginRight: 4 }}></Text>
                  <Text style={{ color: '#239ea0', fontWeight: 'bold', fontSize: 14 }}>للاستفسارات</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable List */}
              <ScrollView style={{ flex: 1, backgroundColor: '#f7fafd', margin: 12, marginTop: 8, borderRadius: 16, padding: 8 }} contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}>
                {/* Example package data */}
                {selectedOrganization?.PackageDetail?.map((pkg: any) => (
                  <View key={pkg.id} style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    width: '100%',
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                  }}>
                    <Text style={{ color: '#239ea0', fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'left' }}>{pkg.TitleSlang}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={{ color: '#888', fontSize: 14, marginLeft: 4 }}>سعر الجلسة /</Text>
                      <Text style={{ color: '#ff6b57', fontWeight: 'bold', fontSize: 16 }}>{pkg.SessionPrice} ريال</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Sticky Bottom Button */}
              <View style={{ backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#f0f0f0' }}>
                <TouchableOpacity onPress={() => setShowPackageList(false)} style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>حجز موعد</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView> :
            isHomeDialysisBooking ? null : <HomeDialysisBookingScreen onPressContinue={continueFromHomeDialysisBooking} onPressBack={closeBottomSheetHomeDialysisBooking} selectedOrganization={selectedOrganization} SetInitialStep={handleStepsForHomeDialysisBooking} />
        }

      </CustomBottomSheet>

      <CustomBottomSheet
        visible={filterBottomSheetVisible}
        onClose={() => setFilterBottomSheetVisible(false)}

        showHandle={false}
        height="50%"
      >
        <View style={{ height: 50, width: '100%', backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
          <Text style={[globalTextStyles.bodyLarge, { fontWeight: '600', color: '#000' }]}>فلتر</Text>
          <TouchableOpacity onPress={() => setFilterBottomSheetVisible(false)}>
            <AntDesign name="close" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 10 }}>

          <Dropdown
            data={SortBy}
            containerStyle={{ height: 50 }}
            dropdownStyle={[{ height: 50 }]}
            value={sortByValue}
            onChange={(value: string | number) => {
              setSortByValue(value.toString());
            }}
            placeholder=""
          />
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <RadioButton
              selected={selectServiceFilter === 'All'}
              onPress={() => setSelectServiceFilter('All')}
              label="طبيب عام"
              style={{ width: "30%", }}
            />
            <RadioButton
              selected={selectServiceFilter === 'remote'}
              onPress={() => setSelectServiceFilter('remote')}
              label="استشاري"
              style={{ width: "30%", }}
            />
            <RadioButton
              selected={selectServiceFilter === 'onsite'}
              onPress={() => setSelectServiceFilter('onsite')}
              label="أخصائي"
              style={{ width: "30%", }}
            />
          </View>

          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <RadioButton
              selected={selectSpecialtyFilter === 'AllType'}
              onPress={() => setSelectSpecialtyFilter('AllType')}
              label="الكل"
              style={{ width: "30%", }}
            />
            <RadioButton
              selected={selectSpecialtyFilter === 'withHospital'}
              onPress={() => setSelectSpecialtyFilter('withHospital')}
              label="تابع لمستشفى"
              style={{ width: "35%", }}
            />
            <RadioButton
              selected={selectSpecialtyFilter === 'individual'}
              onPress={() => setSelectSpecialtyFilter('individual')}
              label="طبيب مستقل"
              style={{ width: "30%", }}
            />
          </View>

          <TouchableOpacity style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 }} onPress={() => {
            setFilterBottomSheetVisible(false)
            handleApplyFilterPress()
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>تطبيق الفلتر</Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
  },
  list: {
    alignItems: 'center',
  },
  card: {
    marginHorizontal: CARD_MARGIN,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4.5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 40,
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  day: {
    ...globalTextStyles.bodySmall,
    color: '#333'
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 6,
  },
  searchInputContainer: {
    flex: 0.6,
  },
  searchInput: {
    marginBottom: 0,
    height: 40,
  },
  filterButton: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  filterButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#179c8e',
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bottomSheetIndicator: {
    backgroundColor: '#e0e0e0',
    width: 40,
  },
  filterContent: {
    padding: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
  },
  selectedTimeSlot: {
    backgroundColor: '#179c8e',
    borderColor: '#179c8e',
  },
  timeSlotText: {
    color: '#333',
    fontSize: 14,
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  BottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  backButton: {
    width: "34%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#179c8e',
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: '#179c8e',
  },
  backButtonText: {
    color: '#179c8e',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'center',
    position: 'relative',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  providerName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 2,
    color: '#222',
  },
  ratingText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceText: {
    color: '#179c8e',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 4,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  scrollButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialtiesScrollView: {
    flex: 1,
  },
  specialtiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  specialtyPill: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  specialtyText: {
    color: '#222',
    fontSize: 12,
  },
  videoInfo: {
    color: '#888',
    fontSize: 13,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 8,
  },
  selectTimeLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 4,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#179c8e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  timeButtonText: {
    color: '#179c8e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  arrowButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f7f7f7',
    marginHorizontal: 2,
  },
  disabledNextButton: {
    backgroundColor: '#ccc',
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
    ...globalTextStyles.bodyMedium,
  },
  closeIcon: {
    fontSize: 22,
    color: '#888',
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  modalMessage: {
    ...globalTextStyles.bodyMedium,
    marginBottom: 24,
    textAlign: 'center',
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
    ...globalTextStyles.bodyMedium,
    color: '#fff',
  },
});

export default DoctorListing; 