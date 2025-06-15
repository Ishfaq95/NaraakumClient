import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import moment, { Moment } from 'moment';
import 'moment-hijri';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import FilterIcon from '../../assets/icons/FilterIcon';
import SearchInput from '../common/SearchInput';
// import BottomSheet from '@gorhom/bottom-sheet';

const CARD_MARGIN = 2;
const MIN_CARD_WIDTH = 48;
const MAX_CARD_WIDTH = 60;

interface DayItem {
  day: string;
  date: string;
  fullDate?: Moment;
  isHijri?: boolean;
  hijriDate?: string;
  hijriMonth?: string;
  icon?: boolean;
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

const Step2 = () => {
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [days, setDays] = useState<DayItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  // const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    generateDays();
  }, []);

  const generateDays = () => {
    const today = moment();
    const daysArray: DayItem[] = [];

    // Generate 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const currentDate = moment().add(i, 'days');
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
  };

  const handleCalendarPress = () => {
    console.log('Open calendar picker');
  };

  const handleNext = () => {
    console.log('Next pressed');
  };

  const handleBack = () => {
    console.log('Back pressed');
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    // bottomSheetRef.current?.expand();
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // bottomSheetRef.current?.close();
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
              selectedTime === slot.value && styles.selectedTimeSlot,
            ]}
            onPress={() => handleTimeSelect(slot.value)}
          >
            <Text
              style={[
                styles.timeSlotText,
                selectedTime === slot.value && styles.selectedTimeSlotText,
              ]}
            >
              {slot.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <FlatList
          data={days}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => item.icon ? handleCalendarPress() : item.fullDate && handleDateSelect(item.fullDate)}
              style={[
                styles.card,
                {
                  backgroundColor: item.fullDate && selectedDate.isSame(item.fullDate, 'day') ? '#179c8e' : '#f7f7f7',
                },
              ]}
            >
              {item.icon ? (
                <CalendarIcon width={24} height={24} color="#179c8e" />
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
      {/* <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['50%']}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        {renderFilterContent()}
      </BottomSheet> */}
      <View style={styles.BottomContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>رجوع</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>التالي</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#179c8e',
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
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
});

export default Step2; 