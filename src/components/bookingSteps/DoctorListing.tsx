import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Image, ScrollView, Dimensions, I18nManager } from 'react-native';
import moment, { Moment } from 'moment';
import 'moment-hijri';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import FilterIcon from '../../assets/icons/FilterIcon';
import SearchInput from '../common/SearchInput';
import { useSelector } from 'react-redux';
import { bookingService } from '../../services/api/BookingService';
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../shared/utils/constants';
import LeftArrow from '../../assets/icons/LeftArrow';
import RightArrow from '../../assets/icons/RightArrow';
import ServiceProviderCard from './ServiceProviderCard';
import { generateSlots, generateSlotsForDate, getUniqueAvailableSlots } from '../../utils/timeUtils';
import FullScreenLoader from "../FullScreenLoader";
import { useTranslation } from 'react-i18next';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import BottomSheet from '@gorhom/bottom-sheet';

const CARD_MARGIN = 2;
const MIN_CARD_WIDTH = 48;
const MAX_CARD_WIDTH = 60;
const { width: deviceWidth } = Dimensions.get('window');
const minItemWidth = 48;
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

const DoctorListing = ({onPressNext,onPressBack}:any) => {
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [days, setDays] = useState<DayItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [allAvailabilityData, setAllAvailabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const services = useSelector((state: any) => state.root.booking.services);
  const category = useSelector((state: any) => state.root.booking.category);
  const cardItems = useSelector((state: any) => state.root.booking.cardItems);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedDateCareProviderAvailability, setSelectedDateCareProviderAvailability] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const { i18n } = useTranslation();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const isRTL = I18nManager.isRTL;
  const currentLang = i18n.language;
  const [customDateSelected, setCustomDateSelected] = useState(false);
  const [changedSelectedDate, setChangedSelectedDate] = useState(moment());
  const [isFlatListReady, setIsFlatListReady] = useState(false);
  const { t } = useTranslation();
  const selectedSpecialtyOrService = CardArray[CardArray.length - 1]?.selectedSpecialtyOrService;

  console.log("CardArray",services)

  const getServiceIds = () => {
    if (selectedSpecialtyOrService?.CatLevelId === 3) {
      // If level 3 is selected, return only that service ID
      return selectedSpecialtyOrService.Id;
    } else {
      // Otherwise, return all service IDs except level 3, comma-separated
      return services
        .filter((service: any) => service?.CatLevelId !== 3)
        .map((service: any) => service.Id)
        .join(',');
    }
  };

  useEffect(() => {
    // Call both APIs when component mounts
    if (category.Id && services.length > 0 && selectedSpecialtyOrService.Id) {
      fetchServiceProviders();
      fetchInitialAvailability();
    }
    generateDays();
  }, [category, services, selectedSpecialtyOrService]);

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      const serviceIds = getServiceIds();
      let requestBody:any = {};
      if(selectedSpecialtyOrService.CatLevelId == 3){
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
      }else{
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
          SpecialtyIds:selectedSpecialtyOrService.Id
        }
      }

      

      console.log("requestBody",requestBody);
      const response = await bookingService.getServiceProviderListByService(requestBody);

      setServiceProviders(response?.ServiceProviderList || []);
    } catch (error) {
      console.error('Error fetching service providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialAvailability = async (date?:any) => {
    try {
      setLoader2(true);
      const serviceIds = getServiceIds();

      const requestBody = {
        CatServiceId: serviceIds,
        CatSpecialtyId: 0,
        StartDate:date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
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

  const generateDays = (startDate?: moment.Moment) => {
    const baseDate = startDate ? moment(startDate) : moment();
    const daysArray: DayItem[] = [];
  
    // Generate 7 days starting from the given base date
    for (let i = 0; i < 7; i++) {
      const currentDate = moment(baseDate).add(i, 'days');
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
  
    setDays(daysArray);
  };

  const handleDateSelect = (date: Moment) => {
    setSelectedDate(date);

    console.log("date",date)
    console.log("selectedDate",selectedDate)

    const baseDate = changedSelectedDate
    ? moment(changedSelectedDate).local().startOf('day')  // Force local timezone
    : moment().startOf('day');
  
    console.log("baseDate",baseDate)
  const isWithinSevenDays = moment(date).local().isBetween(
    baseDate,
    moment(baseDate).add(6, 'days').endOf('day'),
    'day',
    '[]'
  );


    if (isWithinSevenDays) {
      
      filterAvailabilityForDate(date, allAvailabilityData);
    } else {
      setChangedSelectedDate(date)
      const formattedDate = date.format('YYYY-MM-DD');
      generateDays(moment(formattedDate));
      fetchInitialAvailability(moment(formattedDate));
    }
  };

  const handleCalendarPress = () => {
    setCalendarVisible(true);
  };

  const handleCalendarConfirm = (date: Date) => {
    setCalendarVisible(false);
    // If Arabic, convert to Hijri moment
    // if (currentLang === 'ar') {
    //   const hijriMoment = moment(date).locale('ar-sa').format('iYYYY-iMM-iDD');
    //   // Use moment-hijri to parse
    //   const hijriDate = moment(hijriMoment, 'iYYYY-iMM-iDD');
    //   console.log("hijriDate",hijriDate)
    //   handleDateSelect(hijriDate);
    // } else {
    
      handleDateSelect(moment(date));
    // }
  };

  const handleCalendarCancel = () => {
    setCalendarVisible(false);
  };

  const handleNext = () => {
    onPressNext();
  };

  const handleBack = () => {
    onPressBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchServiceProviders(); // Refetch with new search query
  };

  const handleFilterPress = () => {
    // bottomSheetRef.current?.expand();
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (scrollViewRef.current) {
      const scrollAmount = 100; // Adjust this value as needed
      const currentPosition = scrollPosition;
      const newPosition = direction === 'left'
        ? Math.max(0, currentPosition - scrollAmount)
        : currentPosition + scrollAmount;

      scrollViewRef.current.scrollTo({ x: newPosition, animated: true });
    }
  };

  const renderFilterContent = () => (
    <View style={styles.filterContent}>
      <Text style={styles.filterTitle}>اختر الموعد</Text>
      <View style={styles.timeSlotsContainer}>
        {TIME_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot.value}
            style={[
              styles.timeSlot,
              false && styles.selectedTimeSlot,
            ]}
            onPress={() => {}}
          >
            <Text
              style={[
                styles.timeSlotText,
                false && styles.selectedTimeSlotText,
              ]}
            >
              {slot.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Helper to render specialties/tags
  const renderSpecialties = (specialties: Specialty[]) => (
    <View style={styles.specialtyContainer}>
      <TouchableOpacity
        onPress={() => scrollByAmount('left')}
        style={styles.scrollButton}
      >
        {isRTL ? <RightArrow /> : <LeftArrow />}
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specialtiesScrollView}
        onScroll={(event) => {
          setScrollPosition(event.nativeEvent.contentOffset.x);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.specialtiesRow}>
          {specialties.map((spec, index) => (
            <View key={`${spec.CatSpecialtyId}-${spec.UserloginInfoId}-${index}`} style={styles.specialtyPill}>
              <Text style={styles.specialtyText}>
                {isRTL ? spec.TitleSlang : spec.TitlePlang}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => scrollByAmount('right')}
        style={styles.scrollButton}
      >
        {isRTL ? <LeftArrow /> : <RightArrow />}
      </TouchableOpacity>
    </View>
  );

  // Helper to render available times
  const renderTimes = (times: string[]) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
      {/* Left arrow */}
      <TouchableOpacity style={styles.arrowButton}><Text>{'<'}</Text></TouchableOpacity>
      {times.map((time) => (
        <TouchableOpacity key={`time-${time}`} style={styles.timeButton}>
          <Text style={styles.timeButtonText}>{time}</Text>
        </TouchableOpacity>
      ))}
      {/* Right arrow */}
      <TouchableOpacity style={styles.arrowButton}><Text>{'>'}</Text></TouchableOpacity>
    </View>
  );

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
                  <Text style={[styles.date, item.fullDate && selectedDate.isSame(item.fullDate, 'day') && { color: '#fff' }]}>
                    {item.hijriDate}
                  </Text>
                  <Text style={[styles.day, item.fullDate && selectedDate.isSame(item.fullDate, 'day') && { color: '#fff' }]}>
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
      {/* Service Providers List */}
      {serviceProviders.length > 0 && availability.length > 0 && 
      <View style={{flex:1,paddingBottom:50,paddingTop:10}}> 
        <FlatList
        data={serviceProviders}
        onLayout={() => {
          setIsFlatListReady(true);
        }}
        onContentSizeChange={(w, h) => {
          setIsFlatListReady(false);
        }}
        keyExtractor={(item) => item.RowId}
        renderItem={({ item }) => {
          const providerAvailability = availability.flatMap(avail =>
            avail.Detail.filter((detail: any) => detail.ServiceProviderId === item.UserId)
          );

          const dayOfWeek = new Date(selectedDate.format('YYYY-MM-DD')).toLocaleString("en-US", {
            weekday: "long",
          });
          
          const holidays = providerAvailability[0]?.ServiceProviderHolidays?.split(',');

          if (providerAvailability.length > 0) {
            if(holidays?.includes(dayOfWeek)){
              return null
            }
            return <ServiceProviderCard
              provider={item}
              selectedDate={selectedDate}
              availability={providerAvailability[0]}
            />
          } else {
            return null
          }
        }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
      </View>
      }
      <View style={styles.BottomContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.nextButton, cardItems.length === 0 && styles.disabledNextButton]} 
          onPress={handleNext}
          disabled={cardItems.length === 0}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>

      <FullScreenLoader visible={loading || loader2 || isFlatListReady} />
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
    marginBottom: 1,
  },
  day: {
    fontSize: 11,
    color: '#333',
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
    color: '#179c8e',
    fontSize: 14,
    fontWeight: '500',
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
    height:60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  backButton: {
    width:"34%",
    height:50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#179c8e',
    alignItems:"center",
    justifyContent:"center",
  },
  nextButton: {
    width:"64%",
    height:50,
    alignItems:"center",
    justifyContent:"center",
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
    fontWeight: '600',
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
});

export default DoctorListing; 