import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../shared/utils/constants';
import LeftArrow from '../../assets/icons/LeftArrow';
import RightArrow from '../../assets/icons/RightArrow';
import { generateSlotsForDate } from '../../utils/timeUtils';
import CheckIcon from '../../assets/icons/CheckIcon';
import { useSelector, useDispatch } from 'react-redux';
import { addCardItem, manageTempSlotDetail, removeCardItem } from '../../shared/redux/reducers/bookingReducer';
import { globalTextStyles } from '../../styles/globalStyles';
import { convertArabicTimeTo24Hour } from '../../shared/services/service';

interface Specialty {
  CatSpecialtyId: string;
  TitlePlang: string;
  TitleSlang: string;
  UserloginInfoId: string;
  CatLevelId: number;
  LevelTitlePlang: string;
  LevelTitleSlang: string;
}

interface AvailabilityDetail {
  ServiceProviderId: string;
  StartTime: string;
  EndTime: string;
}

interface Availability {
  Detail: AvailabilityDetail[];
}

interface TimeConfig {
  Id: string;
  CatServiceId: string;
  CatSpecialtyId: string;
  StartTime: string;
  EndTime: string;
  CatAvailabilityTypeId: string;
  ServiceProviderId: string;
  StartDate: string;
  EndDate: string;
  OrganizationId: string;
  ShowCareProviderInfo: boolean;
  ServiceProviderHolidays: string | null;
  UnavailableStartdate: string | null;
  UnavailableEnddate: string | null;
  UnavailableStartTime: string | null;
  UnavailableEndTime: string | null;
  BookedSlots: any[];
}

interface TimeSlot {
  date: string;
  fullTime: string;
  start_time: string;
  end_time: string;
  availability_type_id: string;
  is_holiday: boolean;
  available: boolean;
}

interface Service {
  CatCategoryId: string;
  CatCategoryTypeId: number;
  CatLevelId: number;
  CatServiceCategoryId: string;
  CatServiceServeTypeId: number;
  DescriptionPlang: string;
  DescriptionSlang: string;
  FeatureExcludedPlang: string;
  FeatureExcludedSlang: string;
  FeatureIncludedPlang: string;
  FeatureIncludedSlang: string;
  Id: string;
  ImagePath: string;
  Price: number;
  TitlePlang: string;
  TitleSlang: string;
  iswithNurse: boolean;
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
  slots?: any[];
  OrganizationServiceIds: string;
}

interface ServiceProviderCardProps {
  hospital: any;
  onTimeSelect?: (time: string) => void;
  selectedDate: any;
  availability: any;
  selectedSlotInfo?: any;
  onSelectSlot: any;
  selectedService?: any;
}

const HospitalCard: React.FC<ServiceProviderCardProps> = React.memo(({
  hospital,
  onTimeSelect,
  selectedDate,
  availability,
  selectedSlotInfo,
  onSelectSlot,
  selectedService
}) => {
  const dispatch = useDispatch();
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const services = useSelector((state: any) => state.root.booking.services);
  const cardItems = useSelector((state: any) => state.root.booking.cardItems);
  const tempSlotDetail = useSelector((state: any) => state.root.booking.tempSlotDetail);
  const selectedUniqueId = useSelector((state: any) => state.root.booking.selectedUniqueId);
  const selectedCard = CardArray.filter((item: any) => item.ItemUniqueId === selectedUniqueId);

  const [specialtiesScrollPosition, setSpecialtiesScrollPosition] = useState(0);
  const [timeSlotsScrollPosition, setTimeSlotsScrollPosition] = useState(0);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const specialtiesScrollViewRef = useRef<ScrollView>(null);
  const timeSlotsScrollViewRef = useRef<ScrollView>(null);
  const isRTL = true;

  const lastCardItem = tempSlotDetail;
  const isProviderSelected = lastCardItem && lastCardItem?.OrganizationId === hospital?.OrganizationId;
  const selectedCardItem = isProviderSelected ? lastCardItem : null;

  // Helper function to calculate total price from comma-separated prices
  const calculateTotalPrice = (pricesString: string): number => {
    if (!pricesString) return 0;
    const prices = pricesString.split(',').map(price => parseFloat(price.trim()) || 0);
    return prices.reduce((sum, price) => sum + price, 0);
  };

  const isPastTime = useCallback((slot: TimeSlot) => {
    // Only check past times if the selected date is today
    const today = new Date();
    const selectedDateObj = new Date(selectedDate.format('YYYY-MM-DD'));

    // If selected date is not today, all slots are available
    if (selectedDateObj.toDateString() !== today.toDateString()) {
      return false;
    }

    const inputTime = slot.fullTime;

    // Get current time
    const now = new Date();
    const slotTime = new Date();
    const [inputHours, inputMinutes] = inputTime.split(':').map(Number);

    // Set the time of slot date to match the input
    slotTime.setHours(inputHours);
    slotTime.setMinutes(inputMinutes);
    slotTime.setSeconds(0);
    slotTime.setMilliseconds(0);

    return slotTime < now;
  }, [selectedDate]);

  useEffect(() => {
    if (timeSlots.length > 0) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Find the next available slot after current time
      const nextSlotIndex = timeSlots.findIndex(slot => {
        const [slotHour, slotMinute] = slot.fullTime.split(':').map(Number);
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);

        // Convert to minutes for easier comparison
        const slotTimeInMinutes = slotHour * 60 + slotMinute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        return slotTimeInMinutes > currentTimeInMinutes && slot.available;
      });

      setTimeout(() => {
        if (timeSlotsScrollViewRef.current) {
          if (timeSlotsScrollViewRef.current) {
            const slotWidth = 104;
            const scrollAmount = slotWidth * nextSlotIndex / 2;
            const currentPosition = timeSlotsScrollPosition;
            const newPosition = true
              ? Math.max(0, currentPosition - scrollAmount)
              : currentPosition + scrollAmount;

            requestAnimationFrame(() => {
              timeSlotsScrollViewRef.current?.scrollTo({
                x: newPosition,
                animated: true
              });
            });
          }
        }
      }, 1000);
    }
  }, [timeSlots]);

  const checkSelectedSlotInfo=()=>{
    let returnVal=false
    if(selectedSlotInfo){
      returnVal= selectedSlotInfo?.OrganizationId == hospital?.OrganizationId
    }else{
      returnVal= selectedCard[0]?.OrganizationId == hospital?.OrganizationId
    }
    
    return returnVal;
  }

  // Memoize static content to prevent unnecessary re-renders
  const providerInfo = useMemo(() => (
    <>
      <View style={[{ flexDirection: 'row', width: '100%' }, checkSelectedSlotInfo() && styles.selectedProviderCard]}>
        {checkSelectedSlotInfo() && <View style={{ position: 'absolute', right: 10, bottom: 10, alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon width={40} height={40} color="#fff" />
        </View>}
        <View style={{ width: '30%' }}>
          {hospital?.ImagePath ? (
            <Image
              source={{ uri: `${MediaBaseURL}/${hospital?.ImagePath}` }}
              style={styles.providerImage}
              resizeMode="cover"
            />
          ) : (
            <UserPlaceholder width={80} height={80} />
          )}
        </View>
        <View style={{ width: '70%' }}>
          <Text style={styles.providerName}>{hospital?.TitleSlang}</Text>
          <View style={{ flexDirection: 'row',alignItems: 'center', marginVertical: 2 }}>
            <Text style={styles.ratingText}>{hospital?.AccumulativeRatingAvg.toFixed(1)}</Text>
            <Text style={[globalTextStyles.caption, { color: '#888' }]}> ({hospital?.AccumulativeRatingNum} تقييم)</Text>
            <Text style={{ color: '#FFD700', marginLeft: 2 }}>★</Text>
          </View>
        </View>
      </View>
   
        <View style={{ width: '100%', paddingVertical: 10, backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 10, marginVertical: 10 }}>
          <Text style={[styles.priceText, { textAlign: 'left' }]}>
            {isRTL ? `سعر ${calculateTotalPrice(hospital?.Prices).toFixed(0)}` : `Price ${calculateTotalPrice(hospital?.Prices).toFixed(0)}`}
          </Text>
        </View> 
    </>
  ), [hospital, isProviderSelected, selectedSlotInfo, selectedService]);



  const scrollTimeSlots = useCallback((direction: 'left' | 'right') => {
    if (timeSlotsScrollViewRef.current) {
      const scrollAmount = 120;
      const currentPosition = timeSlotsScrollPosition;
      const newPosition = direction === 'left'
        ? Math.max(0, currentPosition - scrollAmount)
        : currentPosition + scrollAmount;

      timeSlotsScrollViewRef.current.scrollTo({
        x: newPosition,
        animated: true
      });
    }
  }, [timeSlotsScrollPosition]);

  // Helper to convert Arabic AM/PM to English AM/PM
  const convertArabicTime = (timeStr: string) => {
    return timeStr.replace('م', 'PM').replace('ص', 'AM').trim();
  };

  // Converts time string and date to a Date object
  const getDateTime = (date: string, time: string, is24Hour = false) => {
    if (is24Hour) {
      // time is already in HH:mm format
      const [hour, minute] = time.split(':').map(Number);
      return new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
    } else {
      // convert AM/PM time (e.g., 11:30 PM)
      const formattedTime = convertArabicTime(time);
      const [timePart, period] = formattedTime.split(' ');
      let [hour, minute] = timePart.split(':').map(Number);
      if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
    }
  };

  const isTimeSlotAvailable = (slot: TimeSlot) => {
    return !isPastTime(slot);
  }

  const handleSlotSelect = useCallback((time: any) => {
    onSelectSlot(hospital, time);


    const updatedCardArray = [...CardArray];

    // Find the correct price for the selected service
    const serviceIds = hospital?.ServiceIds.split(',');
    const prices = hospital?.Prices.split(',');

    // Update each selected item with service-specific values
    selectedCard.forEach((selectedItem: any) => {
      const itemIndex = updatedCardArray.findIndex(cardItem => 
        cardItem.ItemUniqueId === selectedItem.ItemUniqueId && 
        cardItem.CatServiceId === selectedItem.CatServiceId
      );
      
      if (itemIndex !== -1) {
        // Get the specific price for this service
        const serviceId = selectedItem.CatServiceId;
        const servicePriceIndex = serviceIds.findIndex((id: string) => id === serviceId);
        const servicePrice = servicePriceIndex !== -1 ? prices[servicePriceIndex] : "0";
        const serviceOrgId = hospital?.OrganizationServiceIds.split(',')[servicePriceIndex];

        updatedCardArray[itemIndex] = {
          ...updatedCardArray[itemIndex],
          "OrganizationServiceId": serviceOrgId,
          "OrganizationId": hospital?.OrganizationId,
          "ServiceCharges": servicePrice,
          "ServiceProviderUserloginInfoId": 0,
          "SchedulingDate": selectedDate.format('YYYY-MM-DD'),
          "SchedulingTime": convertArabicTimeTo24Hour(time.start_time),
          "AvailabilityId": availability.Id,
          "CatSchedulingAvailabilityTypeId": availability.CatAvailabilityTypeId,
          "ServiceProviderFullnameSlang": hospital?.FullnameSlang,
          "orgTitleSlang": hospital?.TitleSlang,
        };
      }
    });

    dispatch(addCardItem(updatedCardArray));
    }, [hospital, onSelectSlot, CardArray, selectedService, services, selectedDate, availability, dispatch, selectedCard]);

  const renderTimeSlots = useMemo(() => {
    return (
      <View style={styles.specialtyContainer}>
        <TouchableOpacity
          onPress={() => scrollTimeSlots('left')}
          style={[styles.scrollButton, styles.leftScrollButton]}
          activeOpacity={0.7}
        >
          {isRTL ? <RightArrow /> : <LeftArrow />}
        </TouchableOpacity>

        <ScrollView
          ref={timeSlotsScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.specialtiesScrollView}
          onScroll={(event) => setTimeSlotsScrollPosition(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          snapToInterval={120}
          decelerationRate={0}
          snapToAlignment="start"
          contentContainerStyle={styles.timeSlotsContent}
        >
          <View style={styles.specialtiesRow}>
            {hospital?.slots && hospital?.slots.map((slot: any, index: any) => {
              let isSelected = selectedSlotInfo?.OrganizationId === hospital?.OrganizationId &&
                selectedSlotInfo?.slotTime === slot.start_time;
              const isPast = isPastTime(slot);
              const isDisabled = !slot.available || isPast;

              if(selectedCard[0]?.OrganizationId == hospital?.OrganizationId && slot.fullTime == selectedCard[0]?.SchedulingTime){
                isSelected=true;
              }

              if(isDisabled){
                return null;
              }

              return (
                <TouchableOpacity
                  key={`time-${slot.start_time}-${index}`}
                  style={[
                    styles.timeButton,
                    isSelected && styles.selectedTimeButton,
                    isDisabled && styles.disabledTimeButton
                  ]}
                  onPress={() => !isDisabled && handleSlotSelect(slot)}
                  activeOpacity={0.5}
                  disabled={isDisabled}
                >
                  <Text style={[
                    styles.timeButtonText,
                    isSelected && styles.selectedTimeButtonText,
                    isDisabled && styles.disabledTimeButtonText
                  ]}>{slot.start_time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => scrollTimeSlots('right')}
          style={[styles.scrollButton, styles.rightScrollButton]}
          activeOpacity={0.7}
        >
          {isRTL ? <LeftArrow /> : <RightArrow />}
        </TouchableOpacity>
      </View>
    );
  }, [hospital?.slots, selectedSlotInfo, hospital?.OrganizationId, isPastTime, handleSlotSelect, scrollTimeSlots, selectedCard]);

  return (
    <View style={[styles.providerCard]}>
      {providerInfo}

      <View style={styles.divider} />
      <View style={{ width: '100%', alignItems: 'flex-start' }}>
        <Text style={styles.selectTimeLabel}>اختر توقيت الزيارة</Text>
      </View>

      {renderTimeSlots}
    </View>
  );
});

const styles = StyleSheet.create({
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
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceText: {
    color: '#179c8e',
    fontWeight: '600',
    fontSize: 16,
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
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    minWidth: 40,
  },
  leftScrollButton: {
    marginRight: 4,
  },
  rightScrollButton: {
    marginLeft: 4,
  },
  specialtiesScrollView: {
    flex: 1,
  },
  specialtiesContent: {
    paddingHorizontal: 8,
  },
  specialtiesRow: {
    flexDirection: 'row',
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
    marginRight: 4,
    backgroundColor: '#fff',
    width: 100,
  },
  disabledTimeButton: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  timeButtonText: {
    color: '#179c8e',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  disabledTimeButtonText: {
    color: '#999',
  },
  timeSlotsContent: {
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  loadingText: {
    marginLeft: 8,
    color: '#179c8e',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#179c8e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  noSlotsText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
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
  selectedProviderCard: {
    backgroundColor: 'rgba(35, 162, 164, .4)',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#179c8e',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  selectedTimeButton: {
    backgroundColor: '#179c8e',
  },
  selectedTimeButtonText: {
    color: '#fff',
  },
});

export default HospitalCard;