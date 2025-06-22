import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../shared/utils/constants';
import LeftArrow from '../../assets/icons/LeftArrow';
import RightArrow from '../../assets/icons/RightArrow';
import { generateSlotsForDate } from '../../utils/timeUtils';
import CheckIcon from '../../assets/icons/CheckIcon';
import { useSelector, useDispatch } from 'react-redux';
import { addCardItem, removeCardItem } from '../../shared/redux/reducers/bookingReducer';

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
  Slots?: any[];
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onTimeSelect?: (time: string) => void;
  selectedDate: any;
  availability: any;
}

const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({
  provider,
  onTimeSelect,
  selectedDate,
  availability
}) => {
  const dispatch = useDispatch();
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const services = useSelector((state: any) => state.root.booking.services);
  const cardItems = useSelector((state: any) => state.root.booking.cardItems);
  const selectedSpecialtyOrService = CardArray[CardArray.length - 1];

  const [specialtiesScrollPosition, setSpecialtiesScrollPosition] = useState(0);
  const [timeSlotsScrollPosition, setTimeSlotsScrollPosition] = useState(0);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState("");

  const specialtiesScrollViewRef = useRef<ScrollView>(null);
  const timeSlotsScrollViewRef = useRef<ScrollView>(null);
  const isRTL = true;

  const lastCardItem = cardItems.length > 0 ? cardItems[cardItems.length - 1] : null;
  const isProviderSelected = lastCardItem && lastCardItem.providerId === provider.UserId;
  const selectedCardItem = isProviderSelected ? lastCardItem : null;

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

  // Generate time slots asynchronously
  useEffect(() => {
    const generateTimeSlots = async () => {
      if (!availability || !selectedDate) {
        setTimeSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      setSlotsError(null);

      try {
        // Use setTimeout to make it async and prevent blocking
        const slots = await new Promise<TimeSlot[]>((resolve, reject) => {
          setTimeout(() => {
            try {
              const formattedDate = selectedDate.format('YYYY-MM-DD');
              const slotDuration = provider.SlotDuration || 30;
              const generatedSlots = generateSlotsForDate(
                availability,
                formattedDate,
                slotDuration,
                'Asia/Karachi' // Your timezone
              );
              resolve(generatedSlots);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        setTimeSlots(slots);
      } catch (error) {
        console.error('Error generating time slots:', error);
        setSlotsError('Failed to load time slots');
        setTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    generateTimeSlots();
  }, [availability, selectedDate, provider.SlotDuration]);



  // Memoize static content to prevent unnecessary re-renders
  const providerInfo = useMemo(() => (
    <>
      <View style={[{ flexDirection: 'row', width: '100%' }, isProviderSelected && styles.selectedProviderCard]}>
        {isProviderSelected && <View style={{ position: 'absolute', right: 10, bottom: 10, alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon width={40} height={40} color="#fff" />
        </View>}
        <View style={{ width: '30%' }}>
          {provider.ImagePath ? (
            <Image
              source={{ uri: `${MediaBaseURL}${provider.ImagePath}` }}
              style={styles.providerImage}
              resizeMode="cover"
            />
          ) : (
            <UserPlaceholder width={80} height={80} />
          )}
        </View>
        <View style={{ width: '70%' }}>
          <Text style={styles.providerName}>{provider.FullnameSlang}</Text>
          <View style={{ flexDirection: 'row', marginVertical: 2 }}>
            <Text style={styles.ratingText}>{provider.AccumulativeRatingAvg.toFixed(1)}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}> ({provider.AccumulativeRatingNum} تقييم)</Text>
            <Text style={{ color: '#FFD700', marginLeft: 2 }}>★</Text>
          </View>
        </View>
      </View>
      {selectedSpecialtyOrService.CatLevelId == 3 ?
        <View style={{ width: '100%', paddingVertical: 10, backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 10, marginVertical: 10 }}>
          <Text style={[styles.priceText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? `سعر ${Number(provider.Prices).toFixed(0)}` : `Price ${Number(provider.Prices).toFixed(0)}`}
          </Text>
        </View> :
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', width: '100%', paddingVertical: 10, backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 10, marginVertical: 10 }}>
          {(() => {
            const serviceIds = provider.ServiceIds.split(',');
            const prices = provider.Prices.split(',');

            // Filter out services that don't exist in the services array or don't have a valid price
            const validServices = serviceIds.map((id, index) => {
              const service = services.find((s: Service) => s.Id === id);
              const price = prices[index];
              // Only include if both service and price exist and price is a valid number
              if (service && price && !isNaN(Number(price))) {
                return {
                  id,
                  price,
                  title: isRTL ? service.TitleSlang : service.TitlePlang
                };
              }
              return null;
            }).filter((service): service is { id: string; price: string; title: string } => service !== null);

            if (validServices.length === 1) {
              const service = validServices[0];
              return (
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
                  <Text style={[styles.priceText, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {`${service.title}: ${Number(service.price).toFixed(0)}`}
                  </Text>
                  <View style={[styles.checkbox, selectedService == "Specialist" && styles.checkedBox]}>
                    {selectedService == "Specialist" && <CheckIcon width={12} height={12} />}
                  </View>
                </View>
              );
            } else if (validServices.length === 2) {
              const [firstService, secondService] = validServices;
              return (
                <>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, width: '50%' }}>
                    <Text style={[styles.priceText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {`${firstService.title}: ${Number(firstService.price).toFixed(0)}`}
                    </Text>
                    <View style={[styles.checkbox, selectedService == "Specialist" && styles.checkedBox]}>
                      {selectedService == "Specialist" && <CheckIcon width={12} height={12} />}
                    </View>
                  </View>
                  <View style={{ width: 1, height: '100%', backgroundColor: '#e0e0e0', marginHorizontal: 10 }} />
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, width: '50%' }}>
                    <Text style={[styles.priceText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {`${secondService.title}: ${Number(secondService.price).toFixed(0)}`}
                    </Text>
                    <View style={[styles.checkbox, selectedService == "Consultant" && styles.checkedBox]}>
                      {selectedService == "Consultant" && <CheckIcon width={12} height={12} />}
                    </View>
                  </View>
                </>
              );
            }
            return null;
          })()}
        </View>}
    </>
  ), [provider, isProviderSelected]);

  const specialtiesSection = useMemo(() => (
    <View style={styles.specialtyContainer}>
      <TouchableOpacity
        onPress={() => scrollSpecialties('left')}
        style={[styles.scrollButton, styles.leftScrollButton]}
        activeOpacity={0.7}
      >
        {isRTL ? <RightArrow /> : <LeftArrow />}
      </TouchableOpacity>

      <ScrollView
        ref={specialtiesScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specialtiesScrollView}
        onScroll={(event) => setSpecialtiesScrollPosition(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        decelerationRate={0}
        contentContainerStyle={styles.specialtiesContent}
      >
        <View style={styles.specialtiesRow}>
          {provider.Specialties.map((spec, index) => (
            <View key={`${spec.CatSpecialtyId}-${spec.UserloginInfoId}-${index}`} style={styles.specialtyPill}>
              <Text style={styles.specialtyText}>
                {isRTL ? spec.TitleSlang : spec.TitlePlang}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => scrollSpecialties('right')}
        style={[styles.scrollButton, styles.rightScrollButton]}
        activeOpacity={0.7}
      >
        {isRTL ? <LeftArrow /> : <RightArrow />}
      </TouchableOpacity>
    </View>
  ), [provider.Specialties]);

  const scrollSpecialties = (direction: 'left' | 'right') => {
    if (specialtiesScrollViewRef.current) {
      const scrollAmount = 100;
      const currentPosition = specialtiesScrollPosition;
      const newPosition = direction === 'right'
        ? Math.max(0, currentPosition - scrollAmount)
        : currentPosition + scrollAmount;

      requestAnimationFrame(() => {
        specialtiesScrollViewRef.current?.scrollTo({
          x: newPosition,
          animated: true
        });
      });
    }
  };

  const scrollTimeSlots = (direction: 'left' | 'right') => {

    if (timeSlotsScrollViewRef.current) {
      const slotWidth = 104;
      const scrollAmount = slotWidth * 2;
      const currentPosition = timeSlotsScrollPosition;
      const newPosition = direction === 'right'
        ? Math.max(0, currentPosition - scrollAmount)
        : currentPosition + scrollAmount;

      requestAnimationFrame(() => {
        timeSlotsScrollViewRef.current?.scrollTo({
          x: newPosition,
          animated: true
        });
      });
    }
  };

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

  // Main check
  const isPastTime = (slot: TimeSlot) => {
    const inputTime = slot.fullTime;

    // Get current time
    const now = new Date();
    const currentTime = new Date();
    const [inputHours, inputMinutes] = inputTime.split(':').map(Number);

    // Set the time of current date to match the input
    currentTime.setHours(inputHours);
    currentTime.setMinutes(inputMinutes);
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);



    return currentTime < now
  };

  const isTimeSlotAvailable = (slot: TimeSlot) => {
    return !isPastTime(slot);
  }

  const handleSlotSelect = (time: any) => {
    const updatedCardArray = [...CardArray];

    // Update last item
    updatedCardArray[CardArray.length - 1] = {
      ...updatedCardArray[CardArray.length - 1],
      providerId: provider.UserId,
      providerName: provider.FullnameSlang,
      selectedSlot: time.start_time,
      selectedDate: selectedDate.format('YYYY-MM-DD'),
      provider: provider,
      availability: availability
    };

    // Dispatch updated array
    dispatch(addCardItem(updatedCardArray));

    // Call the parent callback if provided
    if (onTimeSelect) {
      onTimeSelect(time);
    }
  };

  const renderTimeSlots = () => {
    if (isLoadingSlots) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#179c8e" />
          <Text style={styles.loadingText}>جاري تحميل المواعيد...</Text>
        </View>
      );
    }

    if (slotsError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{slotsError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoadingSlots(true);
              setSlotsError(null);
              // Trigger re-generation
              setTimeSlots([]);
            }}
          >
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (timeSlots.length === 0) {
      return (
        <View style={styles.noSlotsContainer}>
          <Text style={styles.noSlotsText}>لا توجد مواعيد متاحة لهذا اليوم</Text>
        </View>
      );
    }

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
            {timeSlots.map((slot, index) => {
              const isSelected = isProviderSelected && selectedCardItem?.selectedSlot === slot.start_time;
              return (
                <TouchableOpacity
                  key={`time-${slot.start_time}-${index}`}
                  style={[
                    styles.timeButton,
                    isSelected && styles.selectedTimeButton,
                    (!slot.available || isPastTime(slot)) && styles.disabledTimeButton
                  ]}
                  onPress={() => slot.available && !isPastTime(slot) && handleSlotSelect(slot)}
                  activeOpacity={0.7}
                  disabled={!slot.available || isPastTime(slot)}
                >
                  <Text style={[
                    styles.timeButtonText,
                    isSelected && styles.selectedTimeButtonText,
                    (!slot.available || isPastTime(slot)) && styles.disabledTimeButtonText
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
  };

  return (
    <View style={[styles.providerCard]}>
      {providerInfo}
      {specialtiesSection}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, width: '100%' }}>
        <Text style={styles.videoInfo}>استشارة طبية فيديو :</Text>
        <Text style={{ color: '#179c8e' }}>{provider.SlotDuration} دقيقة</Text>

      </View>
      <View style={styles.divider} />
      <View style={{ width: '100%', alignItems: 'flex-start' }}>
        <Text style={styles.selectTimeLabel}>اختر توقيت الزيارة</Text>
      </View>

      {renderTimeSlots()}
      {/*       
      {isProviderSelected && (
        <View style={styles.selectedIndicator}>
          <CheckIcon width={16} height={16} />
          <Text style={styles.selectedIndicatorText}>تم الاختيار</Text>
        </View>
      )} */}
    </View>
  );
};

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

export default ServiceProviderCard;