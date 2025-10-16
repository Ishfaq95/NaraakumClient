import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Image, ScrollView, Dimensions, I18nManager, Alert, Modal, SafeAreaView, Animated, Easing } from 'react-native';
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
import { setApiResponse, prependCardItems, addCardItem, setSelectedUniqueId } from '../../shared/redux/reducers/bookingReducer';
import { store } from '../../shared/redux/store';
import HospitalCard from './HospitalCard';
import HomeDialysis from './HomeDialysis';
import CustomBottomSheet from '../common/CustomBottomSheet';
import HomeDialysisBookingScreen from '../../screens/Booking/HomeDialysisBookingScreen';
import Dropdown from '../common/Dropdown';
import RadioButton from './RadioButton';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../shared/utils/routes';
import CheckIcon from '../../assets/icons/CheckIcon';
import LinearGradient from 'react-native-linear-gradient';
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

// Shimmer placeholder component
const ShimmerPlaceholder = ({ width = 120, height = 14, borderRadius = 6 }: { width?: number | string; height?: number; borderRadius?: number; }) => {
  const shimmerWidth = typeof width === 'string' ? 200 : width;
  const translateX = useRef(new Animated.Value(-shimmerWidth)).current;

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: shimmerWidth,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -shimmerWidth,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    loopAnimation.start();
    return () => {
      loopAnimation.stop();
    };
  }, [translateX, shimmerWidth]);

  return (
    <View style={{ width: width as any, height, borderRadius, overflow: 'hidden', backgroundColor: '#E6E6E6' }}>
      <Animated.View style={{
        width: '40%',
        height: '100%',
        transform: [{ translateX }],
      }}>
        <LinearGradient
          colors={["#E6E6E6", "#F5F5F5", "#E6E6E6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
};

// Card shimmer for service providers and hospitals
const CardShimmer = () => {
  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Avatar shimmer */}
        <ShimmerPlaceholder width={80} height={80} borderRadius={40} />

        {/* Content shimmer */}
        <View style={{ flex: 1, gap: 8 }}>
          <ShimmerPlaceholder width="70%" height={18} borderRadius={4} />
          <ShimmerPlaceholder width="50%" height={14} borderRadius={4} />
          <ShimmerPlaceholder width="40%" height={14} borderRadius={4} />
        </View>
      </View>

      {/* Slots shimmer */}
      <View style={{ marginTop: 12, gap: 8 }}>
        <ShimmerPlaceholder width="30%" height={14} borderRadius={4} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ShimmerPlaceholder width={80} height={36} borderRadius={8} />
          <ShimmerPlaceholder width={80} height={36} borderRadius={8} />
          <ShimmerPlaceholder width={80} height={36} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

// Home Dialysis Card Shimmer
const HomeDialysisCardShimmer = () => {
  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        {/* Avatar shimmer */}
        <ShimmerPlaceholder width={60} height={60} borderRadius={30} />

        {/* Content shimmer */}
        <View style={{ flex: 1, gap: 8 }}>
          <ShimmerPlaceholder width="60%" height={18} borderRadius={4} />
          <ShimmerPlaceholder width="40%" height={14} borderRadius={4} />
        </View>
      </View>

      {/* Buttons shimmer */}
      <View style={{ marginTop: 12, gap: 8 }}>
        <ShimmerPlaceholder width="100%" height={44} borderRadius={8} />
        <ShimmerPlaceholder width="100%" height={44} borderRadius={8} />
      </View>
    </View>
  );
};

// List shimmer loader
const ListShimmerLoader = ({ cardType = 'default' }: { cardType?: 'default' | 'homeDialysis' }) => {
  const ShimmerCard = cardType === 'homeDialysis' ? HomeDialysisCardShimmer : CardShimmer;

  return (
    <View style={{ padding: 16 }}>
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
    </View>
  );
};

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
  const selectedLocation = useSelector((state: any) => state.root.booking.selectedLocation);
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
  const [selectServiceFilter, setSelectServiceFilter] = useState(0);
  const [selectSpecialtyFilter, setSelectSpecialtyFilter] = useState(0);
  const [sortByValue, setSortByValue] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [searchNearMe, setSearchNearMe] = useState(true);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [allSquares, setAllSquares] = useState<any[]>([{
    label: "الجميع",
    value: "0"
  }]);
  const [selectedCity, setSelectedCity] = useState<any>('0');
  const [selectedSquare, setSelectedSquare] = useState<any>('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Refs to store previous filter values
  const prevFiltersRef = useRef({
    selectServiceFilter: 0,
    searchNearMe: true,
    selectedCity: '0',
    selectedSquare: '0',
  });

  // Helper function to check if item has available future slots
  const hasAvailableSlots = useCallback((slots: any[]) => {
    if (!slots || slots.length === 0) return false;

    return slots.some((s: any) => {
      if (!s.available) return false;

      const currentDate = new Date();
      const slotDate = new Date(s.date);
      const slotTime = s.start_time;

      const timeMatch = slotTime.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
      if (!timeMatch) return false;

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3];

      if (period === 'م' && hours !== 12) {
        hours += 12;
      } else if (period === 'ص' && hours === 12) {
        hours = 0;
      }

      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(hours, minutes, 0, 0);

      return slotDateTime > currentDate;
    });
  }, []);

  useEffect(() => {
    if (user) {
      getUserFavorites();
    }
  }, [user])

  const applyFilter = () => {
    setFilterBottomSheetVisible(false);
    if (displayCategory?.Display == "CP") {
      // Get previous values
      const prevFilters = prevFiltersRef.current;

      // Check what changed
      const serviceFilterChanged = prevFilters.selectServiceFilter !== selectServiceFilter;
      const searchNearMeChanged = prevFilters.searchNearMe !== searchNearMe;
      const cityChanged = prevFilters.selectedCity !== selectedCity;
      const squareChanged = prevFilters.selectedSquare !== selectedSquare;

      // Check if any filter changed
      const anyFilterChanged = serviceFilterChanged || searchNearMeChanged || cityChanged || squareChanged;

      if (!anyFilterChanged) {
        // No changes detected, just close the sheet
        return;
      }

      // If selectServiceFilter changed, call both APIs
      if (serviceFilterChanged && selectServiceFilter != 0) {
        const filterServiceIds = services.filter((service: any) => service.CatLevelId == selectServiceFilter).map((service: any) => service.Id);
        fetchServiceProviders(filterServiceIds[0]);
        fetchInitialAvailability(null, filterServiceIds[0]);
      }
      // If other filters changed (searchNearMe, selectedCity, selectedSquare), call only fetchServiceProviders
      else if (searchNearMeChanged || cityChanged || squareChanged) {
        fetchServiceProviders(
          undefined,
          selectedCity != "0" ? selectedCity : null,
          selectedSquare != "0" ? selectedSquare : null,
          searchNearMe ? `${selectedLocation.latitude},${selectedLocation.longitude}` : null
        );
      }

      // Update previous filter values
      prevFiltersRef.current = {
        selectServiceFilter,
        searchNearMe,
        selectedCity,
        selectedSquare,
      };

    } else {
      if (category.Id == "41") {

      } else {
        // Get previous values
        const prevFilters = prevFiltersRef.current;

        // Check what changed
        const serviceFilterChanged = prevFilters.selectServiceFilter !== selectServiceFilter;
        const searchNearMeChanged = prevFilters.searchNearMe !== searchNearMe;
        const cityChanged = prevFilters.selectedCity !== selectedCity;
        const squareChanged = prevFilters.selectedSquare !== selectedSquare;

        // Check if any filter changed
        const anyFilterChanged = serviceFilterChanged || searchNearMeChanged || cityChanged || squareChanged;

        if (!anyFilterChanged) {
          // No changes detected, just close the sheet
          return;
        }

        if (searchNearMeChanged || cityChanged || squareChanged) {
          fetchHospitalListByServices(
            selectedCity != "0" ? selectedCity : null,
            selectedSquare != "0" ? selectedSquare : null,
            searchNearMe ? `${selectedLocation.latitude},${selectedLocation.longitude}` : null
          )
        }

        // Update previous filter values
        prevFiltersRef.current = {
          selectServiceFilter,
          searchNearMe,
          selectedCity,
          selectedSquare,
        };

      }

    }
  }

  useEffect(() => {
    getAllCities();
  }, []);

  const getAllCities = async () => {
    const response = await bookingService.getAllCities();
    if (response.ResponseStatus.STATUSCODE == 200) {
      const mappedCities = response.list.map((item: any) => ({
        label: item.TitleSlang,
        value: item.Id.toString()
      }));

      const citiesWithAll = [
        {
          label: "الجميع",
          value: "0"
        },
        ...mappedCities
      ];

      setAllCities(citiesWithAll);
    }
  }

  const getAllSquares = async (cityId: string) => {
    const response = await bookingService.getAllSquares({ CatCityId: cityId });
    if (response.ResponseStatus.STATUSCODE == 200) {
      const mappedSquares = response.list.map((item: any) => ({
        label: item.Title,
        value: item.ID.toString()
      }));

      const squaresWithAll = [
        {
          label: "الجميع",
          value: "0"
        },
        ...mappedSquares
      ];

      setAllSquares(squaresWithAll);
    }
  }

  const getUserFavorites = async () => {
    const response = await bookingService.getUserFavorites({ UserLogininfoId: user.Id });
    if (response.ResponseStatus.STATUSCODE == 200) {
      setUserFavorites(response.Result);
    } else {
      setUserFavorites([]);
    }
  }

  const createOrderMainBeforePayment = async () => {
    if (isProcessing) return; // Prevent multiple calls

    setIsProcessing(true);
    try {
      
      let selectedUniqueId = null;

    CardArray.forEach((cardItem: any) => {
      const displayCategory = categoriesList.find((item: any) => item.Id == cardItem.CatCategoryId);
      let selectedItem: any = displayCategory?.Display == "CP" ? !cardItem.ServiceProviderUserloginInfoId : !cardItem.OrganizationId;
      if (selectedItem) {
        selectedUniqueId = cardItem.ItemUniqueId;
        return;
      }
    });

      if (selectedUniqueId) {
        setAlertModalVisible(true);
        setAlertModalMessage('لم يتم تحديد الجدول الزمني للخدمة');
        return;
      }

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
    } finally {
      setIsProcessing(false);
    }
  }

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
      fetchServiceProviders(undefined, null, null, category.Id != "42" ? `${selectedLocation.latitude},${selectedLocation.longitude}` : null);
      fetchInitialAvailability();
    } else {
      if (category.Id == "41") {
        getOrganizationByPackage(searchNearMe ? `${selectedLocation.latitude},${selectedLocation.longitude}` : null);
      } else {
        fetchHospitalListByServices(null, null, `${selectedLocation.latitude},${selectedLocation.longitude}`);
        fetchOrganizationSchedulingAvailability();
      }
    }
    setRefreshing(false);
  }

  const getOrganizationByPackage = async (pationLocation?: any, emptySearch?: boolean) => {
    const payload = {
      "Search": emptySearch ? "" : searchQuery,
      "CatCityId": null,
      "PatientLocation": pationLocation || null,
      "CatSquareId": null,
      "PageNumber": 0,
      "PageSize": 10
    }
    const response = await bookingService.getOrganizationByPackage(payload);

    setOrganizationList(response?.OrganizationList || []);
  }

  const fetchHospitalListByServices = async (cityId?: any, squareId?: any, patientLocation?: any, emptySearch?: boolean) => {
    try {
      setLoading(true);
      const payload = {
        CatcategoryId: category.Id,
        ServiceIds: SelectedCardItem?.map((service: any) => service.CatServiceId).join(','),
        Search: emptySearch ? "" : searchQuery,
        PatientLocation: patientLocation || null,
        CatCityId: cityId || null,
        CatSquareId: squareId || null,
        PageNumber: 0,
        PageSize: 100
      }

      const response = await bookingService.getHospitalListByServices(payload);

      if (response?.HospitalList.length == 0) {
        setHospitalWithSlots([])
      }

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

  const fetchServiceProviders = async (serviceID?: string, cityId?: any, squareId?: any, patientLocation?: any, emptySearch?: boolean) => {
    try {
      setLoading(true);
      let serviceIds = "";
      if (serviceID) {
        serviceIds = serviceID;
      } else {
        if (services == null) {
          serviceIds = getServiceIdsFromCardArray();
        } else {
          serviceIds = getServiceIds();
        }
      }


      let requestBody: any = {};
      if (category.Id == "42" || category.Id == "32") {
        if (SelectedCardItem[0]?.CatLevelId == 3) {
          requestBody = {
            CatcategoryId: category.Id,
            ServiceIds: serviceIds,
            Search: emptySearch ? "" : searchQuery,
            PatientLocation: patientLocation || null,
            CatCityId: cityId || null,
            CatSquareId: squareId || null,
            Gender: 2,
            PageNumber: 0,
            PageSize: 100,
          }
        } else {
          requestBody = {
            CatcategoryId: category.Id,
            ServiceIds: serviceIds,
            Search: emptySearch ? "" : searchQuery,
            PatientLocation: patientLocation || null,
            CatCityId: cityId || null,
            CatSquareId: squareId || null,
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
          Search: emptySearch ? "" : searchQuery,
          PatientLocation: patientLocation || null,
          CatCityId: cityId || null,
          CatSquareId: squareId || null,
          Gender: 2,
          PageNumber: 0,
          PageSize: 100,
        }
      }

      const response = await bookingService.getServiceProviderListByServiceByIds(requestBody);

      if (response?.ServiceProviderList.length == 0) {
        setProviderWithSlots([])
      }
      setServiceProviders(response?.ServiceProviderList || []);
    } catch (error) {
      console.error('Error fetching service providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialAvailability = async (date?: any, serviceID?: string) => {
    try {
      setLoader2(true);
      let serviceIds = "";
      if (serviceID) {
        serviceIds = serviceID;
      } else {
        if (services == null) {
          serviceIds = getServiceIdsFromCardArray();
        } else {
          serviceIds = getServiceIds();
        }
      }

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
      filterAvailabilityForDate(date, allAvailabilityData);
      setChangeDateLoader(false)
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
    if (isProcessing) return; // Prevent multiple clicks

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

  }, [CardArray, createOrderMainBeforePayment, isProcessing]);

  const handleBack = () => {
    setSelectedUniqueId(selectedUniqueId);
    onPressBack();
  };

  const handleSearch = (text: string) => {
    if (displayCategory?.Display == "CP") {
      fetchServiceProviders(undefined, undefined, undefined, category.Id != "42" ? searchNearMe ? `${selectedLocation.latitude},${selectedLocation.longitude}` : null : null, text == "" ? true : false); // Refetch with new search query
    } else {
      if (category.Id == "41") {
        getOrganizationByPackage(searchNearMe ? `${selectedLocation.latitude},${selectedLocation.longitude}` : null, text == "" ? true : false);
      } else {
        fetchHospitalListByServices(null, null, searchNearMe ? `${selectedLocation.latitude},${selectedLocation.longitude}` : null, text == "" ? true : false);
      }
    }
  };

  const handleFilterPress = () => {
    setFilterBottomSheetVisible(true)
  };

  const handleSelectSlot = useCallback((provider: any, slot: any) => {
    console.log("SelectedCardItem", SelectedCardItem)
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

  // Memoize filtered providers to prevent unnecessary re-renders
  const filteredProviders = useMemo(() => {
    const filtered = ProviderWithSlots.filter((item: any) => {
      const providerAvailability = availability.flatMap(avail =>
        avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
      );

      if (providerAvailability.length > 0) {
        const dayOfWeek = new Date(selectedDate.locale('en').format('YYYY-MM-DD')).toLocaleString("en-US", {
          weekday: "long",
        });

        const holidays = providerAvailability[0]?.ServiceProviderHolidays?.split(',');
        const holidayCheck = !holidays?.includes(dayOfWeek);

        // Apply specialty filter if selectSpecialtyFilter is not 0
        if (selectSpecialtyFilter != 0) {
          return holidayCheck && item.CatOrganizationModeId == selectSpecialtyFilter;
        }

        return holidayCheck;
      }
      return false;
    });

    // Apply sorting if sortByValue is not 'All'
    if (sortByValue !== 'All') {
      return filtered.sort((a: any, b: any) => {
        const priceA = parseFloat(a.ServiceServe?.[0]?.Price) || 0;
        const priceB = parseFloat(b.ServiceServe?.[0]?.Price) || 0;

        if (sortByValue === 'Asc') {
          return priceA - priceB; // Ascending order
        } else if (sortByValue === 'Desc') {
          return priceB - priceA; // Descending order
        }
        return 0;
      });
    }

    return filtered;
  }, [ProviderWithSlots, availability, selectedDate, selectSpecialtyFilter, sortByValue]);

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

  // Calculate actual result count based on items with available slots
  const resultLength = useMemo(() => {
    if (displayCategory?.Display == "CP") {
      return filteredProviders.filter(item => hasAvailableSlots(item.slots)).length;
    } else if (category.Id == "41") {
      return organizationList.length;
    } else {
      return filteredHospitals.filter(item => hasAvailableSlots(item.slots)).length;
    }
  }, [filteredProviders, organizationList, filteredHospitals, displayCategory, category, hasAvailableSlots]);

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
    if (displayCategory?.Display == "CP") {
      filteredProviders
    } else {

    }
  }

  const getNextButtonEnabled = useCallback(() => {
    if (isProcessing) return true; // Disable button while processing

    if (displayCategory?.Display == "CP") {
      return SelectedCardItem[0]?.CatServiceId == 0 || SelectedCardItem[0]?.CatServiceId == null || SelectedCardItem[0]?.CatServiceId == "" || SelectedCardItem[0]?.CatServiceId == undefined || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == 0 || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == null || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == "" || SelectedCardItem[0]?.ServiceProviderUserloginInfoId == undefined
    } else {
      return SelectedCardItem[0]?.OrganizationId == null || SelectedCardItem[0]?.OrganizationId == "" || SelectedCardItem[0]?.OrganizationId == undefined
    }
  }, [selectedSlotInfo, CardArray, SelectedCardItem, isProcessing])

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

  if (changeDateLoader || loading || loader2 || slotsLoaded) {
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
                onChangeText={(text) => {
                  setSearchQuery(text)
                  if (text == "") {
                    handleSearch(text)
                  }
                }}
                placeholder="بحث عن طبيب "
                style={styles.searchInput}
                onSearch={() => handleSearch(searchQuery)}
              />
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
              <FilterIcon width={20} height={20} color="#179c8e" />
              <Text style={styles.filterButtonText}>تطبيق الفلتر</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ListShimmerLoader cardType="default" />
      </View>
    )
  }

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
              onChangeText={(text) => {
                setSearchQuery(text)
                if (text == "") {
                  handleSearch(text)
                }
              }}
              placeholder="بحث عن طبيب "
              style={styles.searchInput}
              onSearch={() => handleSearch(searchQuery)}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
            <FilterIcon width={20} height={20} color="#179c8e" />
            <Text style={styles.filterButtonText}>تطبيق الفلتر</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ ...globalTextStyles.bodyLarge, fontWeight: '600', color: '#36454f' }}>
          {/* {`النتائج (${resultLength || filteredProviders.length || organizationList.length || filteredHospitals.length})`} */}
          {`النتائج (${resultLength})`}
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
              ListEmptyComponent={
                (loading || loader2 || slotsLoaded) ? (
                  <ListShimmerLoader cardType="default" />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ ...globalTextStyles.bodyLarge, color: '#dc3545' }}>
                      لا يوجد نتائج
                    </Text>
                  </View>
                )
              }
              onRefresh={fetchData}
              refreshing={refreshing}
              renderItem={({ item, index }) => {
                const providerAvailability = availability.flatMap(avail =>
                  avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
                );

                // Check if item has available slots, return null if not
                if (!hasAvailableSlots(item.slots)) {
                  return null;
                }

                return <ServiceProviderCard
                  provider={item}
                  selectedDate={selectedDate}
                  availability={providerAvailability[0]}
                  selectedSlotInfo={selectedSlotInfo}
                  onSelectSlot={handleSelectSlot}
                  onSelectService={handleSelectService}
                  selectedService={selectedService}
                  userFavorites={userFavorites}
                  getUserFavorites={getUserFavorites}
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
                ListEmptyComponent={
                  (loading || loader2 || slotsLoaded) ? (
                    <ListShimmerLoader cardType="homeDialysis" />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ ...globalTextStyles.bodyLarge, color: '#dc3545' }}>
                        لا يوجد نتائج
                      </Text>
                    </View>
                  )
                }
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
                ListEmptyComponent={
                  (loading || loader2 || slotsLoaded) ? (
                    <ListShimmerLoader cardType="default" />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ ...globalTextStyles.bodyLarge, color: '#dc3545' }}>
                        لا يوجد نتائج
                      </Text>
                    </View>
                  )
                }
                renderItem={({ item, index }) => {
                  const providerAvailability = availability.flatMap(avail =>
                    avail.Detail.filter((detail: any) => detail.OrganizationId === item.OrganizationId)
                  );

                  // Check if item has available slots, return null if not
                  if (!hasAvailableSlots(item.slots)) {
                    return null;
                  }

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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, getNextButtonEnabled() ? styles.disabledNextButton : {}]}
          onPress={handleNext}
          disabled={getNextButtonEnabled()}
        >
          <Text style={styles.nextButtonText}>
            {isProcessing ? 'جاري المعالجة...' : t('next')}
          </Text>
        </TouchableOpacity>
      </View>

      <FullScreenLoader visible={changeDateLoader || loading || loader2 || slotsLoaded} />
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
                {/* <View style={{ width: 28 }} /> */}
                <Text style={{ fontSize: 18, color: '#222', textAlign: 'center', fontFamily: globalTextStyles.h5.fontFamily }}>
                  باقات غسيل الكلى المنزلي
                </Text>
                <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)}>
                  <Text style={{ fontSize: 24, color: '#222' }}>×</Text>
                </TouchableOpacity>

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
                <Text style={{ fontSize: 16, color: '#222', fontFamily: globalTextStyles.h5.fontFamily }}>مركز عبر الطبي</Text>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                  {/* Replace with your WhatsApp icon if available */}
                  {/* <Text style={{ color: '#239ea0', fontSize: 18, marginRight: 4, fontFamily: globalTextStyles.h5.fontFamily }}></Text> */}
                  <Ionicons name="logo-whatsapp" size={20} color="green" />
                  <Text style={{ color: '#000', fontSize: 14, paddingRight: 4, fontFamily: globalTextStyles.h5.fontFamily }}>للاستفسارات</Text>
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
                    <Text style={{ color: '#239ea0', fontSize: 16, marginBottom: 8, textAlign: 'left', fontFamily: globalTextStyles.h5.fontFamily }}>{pkg.TitleSlang}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Text style={{ color: '#888', fontSize: 14, marginLeft: 4, fontFamily: globalTextStyles.bodySmall.fontFamily }}>سعر الجلسة /</Text>
                      <Text style={{ color: '#ff6b57', fontSize: 16, fontFamily: globalTextStyles.h5.fontFamily }}>{pkg.SessionPrice} ريال</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Sticky Bottom Button */}
              <View style={{ backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#f0f0f0' }}>
                <TouchableOpacity onPress={() => setShowPackageList(false)} style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontFamily: globalTextStyles.h5.fontFamily }}>حجز موعد</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView> :
            isHomeDialysisBooking ? null : <HomeDialysisBookingScreen onPressContinue={continueFromHomeDialysisBooking} onPressBack={closeBottomSheetHomeDialysisBooking} selectedOrganization={selectedOrganization} SetInitialStep={handleStepsForHomeDialysisBooking} onCloseBottomSheet={() => setIsBottomSheetVisible(false)} />
        }

      </CustomBottomSheet>

      <CustomBottomSheet
        visible={filterBottomSheetVisible}
        onClose={() => setFilterBottomSheetVisible(false)}

        showHandle={false}
        height={category.Id == "42" ? "42%" : category.Id == "32" ? "60%" : "50%"}
      >
        <View style={{ height: 50, width: '100%', backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
          <Text style={[globalTextStyles.bodyLarge, { fontWeight: '600', color: '#000' }]}>فلتر</Text>
          <TouchableOpacity onPress={() => setFilterBottomSheetVisible(false)}>
            <AntDesign name="close" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 10 }}>
          <ScrollView style={{ paddingBottom: 100 }}>
            {category.Id != "42" && <>
              <View style={{ paddingVertical: 10 }}>
                <Dropdown
                  data={allCities}
                  containerStyle={{ height: 50 }}
                  dropdownStyle={[{ height: 50 }]}
                  value={selectedCity}
                  onChange={(value: string | number) => {
                    setSelectedCity(value.toString());
                    if (value.toString() != "0") {
                      getAllSquares(value.toString());
                    }

                  }}
                  placeholder=""
                />
              </View>
              <View style={{ paddingBottom: 10 }}>
                <Dropdown
                  data={allSquares}
                  containerStyle={{ height: 50 }}
                  dropdownStyle={[{ height: 50 }]}
                  value={selectedSquare}
                  onChange={(value: string | number) => {
                    setSelectedSquare(value.toString());

                  }}
                  placeholder=""
                />
              </View>
              <View style={{ paddingBottom: 10 }}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, width: '48%', justifyContent: 'flex-end' }}>
                  <Text style={[styles.priceText, { textAlign: 'left' }]}>
                    {`بحث الأطباء بالقرب مني`}
                  </Text>
                  <TouchableOpacity onPress={() => { setSearchNearMe(!searchNearMe) }} style={[styles.checkbox, searchNearMe && styles.checkedBox]}>
                    {searchNearMe && <CheckIcon width={12} height={12} />}
                  </TouchableOpacity>
                </View>
              </View>
            </>}

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
            {(category.Id == "42" || category.Id == "32") && <>
              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <RadioButton
                  selected={selectServiceFilter === 0}
                  onPress={() => setSelectServiceFilter(0)}
                  label={services == null ? "طبيب عام" : "الكل"}
                  style={{ width: "30%", }}
                />
                <RadioButton
                  selected={selectServiceFilter === 1}
                  onPress={() => setSelectServiceFilter(1)}
                  disabled={services == null}
                  label="استشاري"
                  style={{ width: "30%", }}
                />
                <RadioButton
                  selected={selectServiceFilter === 2}
                  onPress={() => setSelectServiceFilter(2)}
                  disabled={services == null}
                  label="أخصائي"
                  style={{ width: "30%", }}
                />
              </View>

              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <RadioButton
                  selected={selectSpecialtyFilter === 0}
                  onPress={() => setSelectSpecialtyFilter(0)}
                  label="الكل"
                  style={{ width: "30%", }}
                />
                <RadioButton
                  selected={selectSpecialtyFilter === 1}
                  onPress={() => setSelectSpecialtyFilter(1)}
                  label="تابع لمستشفى"
                  style={{ width: "35%", }}
                />
                <RadioButton
                  selected={selectSpecialtyFilter === 2}
                  onPress={() => setSelectSpecialtyFilter(2)}
                  label="طبيب مستقل"
                  style={{ width: "30%", }}
                />
              </View>
            </>}

            <TouchableOpacity style={{ backgroundColor: '#239ea0', borderRadius: 10, marginBottom: 20, paddingVertical: 12, alignItems: 'center', marginTop: 10 }} onPress={() => applyFilter()}>
              <Text style={{ ...globalTextStyles.buttonMedium, color: '#fff' }}>تطبيق الفلتر</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </CustomBottomSheet>

      <Modal
        visible={alertModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setAlertModalVisible(false); }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: 18, alignItems: 'center', padding: 15, }}>
            <View style={{ width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => { setAlertModalVisible(false); }}
              >
                <AntDesign name="close" size={28} color="#888" />
              </TouchableOpacity>
              <Text style={{ ...globalTextStyles.h4, color: '#3a434a', marginBottom: 12 }}>خطأ</Text>
            </View>
            <AntDesign name="exclamationcircle" size={64} color="#d84d48" style={{ marginVertical: 18 }} />
            <Text style={{ color: '#3a434a', fontSize: 18, textAlign: 'center', fontFamily: CAIRO_FONT_FAMILY.medium, lineHeight: 28 }}>
              {alertModalMessage}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setAlertModalVisible(false);
                navigation.navigate(ROUTES.CartStack, {
                  screen: ROUTES.CartScreen,
                })
              }}
              style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, width: '100%', alignItems: 'center', marginTop: 10 }}
            >
              <Text style={{ ...globalTextStyles.buttonMedium, color: '#fff' }}> خدمة الجدول الزمني</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: "30%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#179c8e',
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    width: "68%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: '#179c8e',
  },
  backButtonText: {
    color: '#179c8e',
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.bold,
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
    color: '#666',
    fontFamily: globalTextStyles.buttonLarge.fontFamily,
    fontSize: 14,
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
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#008080',
    // marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#008080',
  },
});

export default DoctorListing; 