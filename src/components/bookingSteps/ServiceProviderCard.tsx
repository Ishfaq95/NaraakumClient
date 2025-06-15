import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../shared/utils/constants';
import LeftArrow from '../../assets/icons/LeftArrow';
import RightArrow from '../../assets/icons/RightArrow';
import { generateSlots } from '../../utils/timeUtils';

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
}

const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({ 
  provider, 
  onTimeSelect,
}) => {
  const [specialtiesScrollPosition, setSpecialtiesScrollPosition] = useState(0);
  const [timeSlotsScrollPosition, setTimeSlotsScrollPosition] = useState(0);
  const specialtiesScrollViewRef = useRef<ScrollView>(null);
  const timeSlotsScrollViewRef = useRef<ScrollView>(null);
  const isRTL = true;

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
      const slotWidth = 120;
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

  return (
    <View style={styles.providerCard}>
      <TouchableOpacity style={styles.favoriteIcon}>
        <Text>♡</Text>
      </TouchableOpacity>

      {provider.ImagePath ? (
        <Image
          source={{ uri: `${MediaBaseURL}${provider.ImagePath}` }}
          style={styles.providerImage}
          resizeMode="cover"
        />
      ) : (
        <UserPlaceholder width={80} height={80} />
      )}

      <Text style={styles.providerName}>{provider.FullnamePlang}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
        <Text style={styles.ratingText}>{provider.AccumulativeRatingAvg.toFixed(1)}</Text>
        <Text style={{ color: '#888', fontSize: 12 }}> ({provider.AccumulativeRatingNum} تقييم)</Text>
        <Text style={{ color: '#FFD700', marginLeft: 2 }}>★</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.priceText}>{provider.Prices} ريال</Text>
        <Text style={[styles.priceText, { color: '#888', fontSize: 14 }]}>
          (شامل الضريبة: {provider.PriceswithTax} ريال)
        </Text>
      </View>

      {/* Specialties Section */}
      <View style={styles.specialtyContainer}>
        <TouchableOpacity 
          onPress={() => scrollSpecialties('left')} 
          style={[styles.scrollButton, styles.leftScrollButton]}
          activeOpacity={0.7}
        >
          {isRTL ? <LeftArrow /> : <RightArrow />}
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
          {isRTL ? <RightArrow /> : <LeftArrow />}
        </TouchableOpacity>
      </View>

      <Text style={styles.videoInfo}>
        <Text style={{ color: '#179c8e' }}>{provider.SlotDuration} دقيقة</Text> : استشارة طبية فيديو
      </Text>
      <View style={styles.divider} />
      <Text style={styles.selectTimeLabel}>اختر توقيت الزيارة</Text>

      {/* Time Slots Section */}
      <View style={styles.specialtyContainer}>
        <TouchableOpacity 
          onPress={() => scrollTimeSlots('left')} 
          style={[styles.scrollButton, styles.leftScrollButton]}
          activeOpacity={0.7}
        >
          {isRTL ? <LeftArrow /> : <RightArrow />}
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
            {provider?.Slots?.map((slot, index) => (
              <TouchableOpacity 
                key={`time-${slot.start_time}-${index}`} 
                style={[
                  styles.timeButton,
                  !slot.available && styles.disabledTimeButton
                ]}
                onPress={() => slot.available && onTimeSelect?.(slot.start_time)}
                activeOpacity={0.7}
                disabled={!slot.available}
              >
                <Text style={[
                  styles.timeButtonText,
                  !slot.available && styles.disabledTimeButtonText
                ]}>{slot.start_time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          onPress={() => scrollTimeSlots('right')} 
          style={[styles.scrollButton, styles.rightScrollButton]}
          activeOpacity={0.7}
        >
          {isRTL ? <RightArrow /> : <LeftArrow />}
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    minWidth: 40,
  },
  leftScrollButton: {
    marginRight: 8,
  },
  rightScrollButton: {
    marginLeft: 8,
  },
  specialtiesScrollView: {
    flex: 1,
  },
  specialtiesContent: {
    paddingHorizontal: 8,
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
  },
  disabledTimeButtonText: {
    color: '#999',
  },
  timeSlotsContent: {
    paddingHorizontal: 8,
  },
});

export default ServiceProviderCard; 