import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import ClockIcon from '../../assets/icons/ClockIcon';
import SettingIconSelected from '../../assets/icons/SettingIconSelected';
import { useTranslation } from 'react-i18next';
import CommonRadioButton from '../../components/common/CommonRadioButton';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import { countries } from '../../utils/countryData';
import { addCardItem, setApiResponse } from '../../shared/redux/reducers/bookingReducer';
import { bookingService } from '../../services/api/BookingService';
import { generatePayloadforOrderMainBeforePayment, generatePayloadforUpdateOrderMainBeforePayment, generateUniqueId } from '../../shared/services/service';
import { useDispatch, useSelector } from 'react-redux';
import { MediaBaseURL } from '../../shared/utils/constants';
import moment from 'moment';

const ReviewOrder = ({ onPressNext, onPressBack }: any) => {
  const { t } = useTranslation();
  const DoctorsNameArray = [
    {
      name: "د. سامي محمد",
      service: "استشارة عن بعد / طبيب عام",
      image: "https://via.placeholder.com/80x80.png?text=Dr+Sami",
      date: "17/06/2025",
      time: "05:00 م",
      duration: "1 ساعة"
    },
    {
      name: "د. أحمد علي",
      service: "استشارة عن بعد / طبيب أطفال",
      image: "https://via.placeholder.com/80x80.png?text=Dr+Ahmed",
      date: "18/06/2025",
      time: "06:00 م",
      duration: "1 ساعة"
    },
    {
      name: "د. فاطمة حسن",
      service: "استشارة عن بعد / طبيب نساء",
      image: "https://via.placeholder.com/80x80.png?text=Dr+Fatima",
      date: "19/06/2025",
      time: "07:00 م",
      duration: "1 ساعة"
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selected, setSelected] = useState('myself');
  const [fullNumber, setFullNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any | undefined>(countries.find(c => c.code === 'sa'));

  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const apiResponse = useSelector((state: any) => state.root.booking.apiResponse);
  const [showGroupedArray, setShowGroupedArray] = useState([]);
  const selectedDoctor: any = showGroupedArray[selectedIndex];
  const dispatch = useDispatch();

  console.log("CardArray===>", user)

  useEffect(() => {
    const getUnPaidUserOrders = async () => {
      try {
        const response = await bookingService.getUnPaidUserOrders({ UserLoginInfoId: user.Id });

        if (response.Cart && response.Cart.length > 0) {
          // Convert API response to cardItems format
          const convertedCardItems = response.Cart;

          // Check for existing items and replace duplicates instead of adding
          const existingCardItems: any[] = [];
          const updatedCardItems = [...existingCardItems];

          convertedCardItems.forEach((newItem: any) => {
            // Find if item already exists by OrderDetailId and OrderId
            const existingIndex = updatedCardItems.findIndex((existingItem: any) =>
              existingItem.OrderDetailId === newItem.OrderDetailId &&
              existingItem.OrderId === newItem.OrderId
            );

            if (existingIndex !== -1) {
              // Replace existing item with new one
              updatedCardItems[existingIndex] = newItem;
            } else {
              // Add new item if it doesn't exist
              const newItemObject = {
                ...newItem,
                "ItemUniqueId": generateUniqueId(),
                PatientUserProfileInfoId: user.UserProfileInfoId,
                TextDescription: "",
              }
              updatedCardItems.push(newItemObject);
            }
          });

          // Dispatch the updated array
          const groupedArray: any = groupArrayByUniqueIdAsArray(updatedCardItems);
          setShowGroupedArray(groupedArray);
          dispatch(addCardItem(updatedCardItems));
        }
      } catch (error) {
      }
    }
    getUnPaidUserOrders();
  }, [user]);

  const groupArrayByUniqueIdAsArray = (dataArray: any) => {
    if (!Array.isArray(dataArray)) {
      console.warn('Input is not an array');
      return [];
    }

    const groupedObject: any = {};

    dataArray.forEach((obj) => {
      const uniqueId = `${obj.ServiceProviderUserloginInfoId}_${obj.OrganizationId}_${obj.PatientUserProfileInfoId}_${obj.CatCategoryId}`;

      if (!groupedObject[uniqueId]) {
        groupedObject[uniqueId] = [];
      }

      groupedObject[uniqueId].push(obj);
    });

    // Convert to array format with uniqueId as property
    return Object.keys(groupedObject).map(uniqueId => ({
      uniqueId: uniqueId,
      items: groupedObject[uniqueId]
    }));
  };

  const renderDoctorTag = ({ item, index }: { item: any; index: number }) => {
    const selectedItem = item.items[0];

    const imagePath = selectedItem.ServiceProviderImagePath ? `${MediaBaseURL}${selectedItem.ServiceProviderImagePath}` : `${MediaBaseURL}${selectedItem.LogoImagePath}`;
    const name = selectedItem.ServiceProviderFullnameSlang ? selectedItem.ServiceProviderFullnameSlang : selectedItem.orgTitleSlang;


    return (
      <View style={styles.doctorTagContainer}>
        <TouchableOpacity
          style={[styles.doctorTag, selectedIndex === index && styles.selectedTag]}
          onPress={() => setSelectedIndex(index)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: imagePath }} style={styles.doctorImage} />
          <View style={styles.doctorInfoCol}>
            <Text style={[styles.doctorName, selectedIndex === index && { color: '#fff' }]}>{t('service_provider')}</Text>
            <Text style={[styles.serviceName, selectedIndex === index && { color: '#fff' }]}>{name}</Text>
          </View>
        </TouchableOpacity>
        {/* Arrow below the tag */}
        {selectedIndex === index && <View style={[styles.arrowIndicatorSimple]}>
          <Text style={styles.arrowText}>▼</Text>
        </View>}
      </View>
    )
  }

  const createOrderMainBeforePayment = async () => {
    const payload = {
      "OrderId": CardArray[0].OrderID,
      "CatPlatformId": 1,
      "OrderDetail": generatePayloadforUpdateOrderMainBeforePayment(CardArray)
    }

    const response = await bookingService.updateOrderMainBeforePayment(payload);

    dispatch(setApiResponse(response.Data))
    onPressNext();
  }

  useEffect(() => {
    if (mobileNumber) {
      handlePhoneNumberChange({ phoneNumber: mobileNumber, isValid: isValidNumber, countryCode: '', fullNumber: '' });
    }
  }, [selectedCountry]);

  const handleNext = () => {
    createOrderMainBeforePayment();
  };

  const handleBack = () => {
    onPressBack();
  };

  const handlePhoneNumberChange = (data: { phoneNumber: string; isValid: boolean; countryCode: string; fullNumber: string }) => {
    setMobileNumber(data.phoneNumber);
    setIsValidNumber(data.isValid);
    setFullNumber(data.fullNumber);
  };

  // Function to calculate duration between start and end time
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';

    try {
      // Parse times (assuming format HH:mm)
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // Convert to total minutes
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      // Calculate difference
      const diffMinutes = endTotalMinutes - startTotalMinutes;

      if (diffMinutes <= 0) return '';

      // Convert to hours and minutes
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours} ساعة ${minutes} دقيقة`;
      } else if (hours > 0) {
        return `${hours} ساعة`;
      } else {
        return `${minutes} دقيقة`;
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '';
    }
  };

  // Function to extract country code and phone number from full number
  const extractPhoneInfo = (fullNumber: string) => {
    if (!fullNumber) return { countryCode: 'SA', phoneNumber: '' };
    
    // Remove any spaces or special characters
    const cleanNumber = fullNumber.replace(/\s/g, '');
    
    // Check for Saudi Arabia number (+966)
    if (cleanNumber.startsWith('+966')) {
      const phoneNumber = cleanNumber.substring(4); // Remove +966
      return { countryCode: 'SA', phoneNumber };
    }
    
    // Check for other country codes (you can add more as needed)
    const countryCodeMap: { [key: string]: string } = {
      '+971': 'AE', // UAE
      '+973': 'BH', // Bahrain
      '+964': 'IQ', // Iraq
      '+98': 'IR',  // Iran
      '+962': 'JO', // Jordan
      '+965': 'KW', // Kuwait
      '+961': 'LB', // Lebanon
      '+968': 'OM', // Oman
      '+970': 'PS', // Palestine
      '+974': 'QA', // Qatar
      '+963': 'SY', // Syria
      '+90': 'TR',  // Turkey
      '+967': 'YE'  // Yemen
    };
    
    for (const [code, country] of Object.entries(countryCodeMap)) {
      if (cleanNumber.startsWith(code)) {
        const phoneNumber = cleanNumber.substring(code.length);
        return { countryCode: country, phoneNumber };
      }
    }
    
    // Default to Saudi Arabia if no match found
    return { countryCode: 'SA', phoneNumber: cleanNumber.replace(/^\+/, '') };
  };

  // Extract phone info from user
  const phoneInfo = extractPhoneInfo(user?.CellNumber || '');
  const defaultCountryCode = phoneInfo.countryCode;
  const defaultPhoneNumber = phoneInfo.phoneNumber;

  console.log("selectedDoctor===>", selectedDoctor?.items?.length)

  return (
    <View style={styles.container}>
      <View style={{ height: 120 }}>
        {/* Doctor tags */}
        <FlatList
          data={showGroupedArray}
          renderItem={renderDoctorTag}
          keyExtractor={(item, index) => `doctor-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {selectedDoctor?.uniqueId && <ScrollView style={{ flex: 1, marginBottom: 60 }}>
        {/* Details card for selected doctor */}
        {
          selectedDoctor?.items?.map((item: any, index: number) => {
            let displayDate = '';
            let displayTime = '';

            if (item.SchedulingDate && item.SchedulingTime) {
              const datePart = item.SchedulingDate.split('T')[0];
              const utcDateTime = moment.utc(`${datePart}T${item.SchedulingTime}:00Z`);
              if (utcDateTime.isValid()) {
                const localDateTime = utcDateTime.local();
                displayDate = localDateTime.format('DD/MM/YYYY');
                displayTime = localDateTime.format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
              }
            }
            
            return (
              <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsHeaderText}>الخدمات المختارة (1)</Text>
                  <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>✎</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.selectedServiceRow}>
                  {item?.CatCategoryId == "42"
                    ? <Text style={styles.selectedServiceText}>{`استشارة عن بعد / ${String(item?.ServiceTitleSlang || item?.TitleSlang || '')}`}</Text>
                    : <Text style={styles.selectedServiceText}>{String(item?.ServiceTitleSlang || item?.TitleSlang || '')}</Text>
                  }
                  <View style={styles.selectedServiceCircle}><Text style={styles.selectedServiceCircleText}>1</Text></View>
                </View>
                {/* Session info with icons */}
                <View style={styles.sessionInfoDetailsContainer}>
                  <View style={styles.sessionInfoDetailItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <CalendarIcon width={18} height={18} />
                      <Text style={styles.sessionInfoLabel}>تاريخ الجلسة</Text>
                    </View>
                    <Text style={styles.sessionInfoValue}>{displayDate}</Text>
                  </View>
                  <View style={styles.sessionInfoDetailItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <ClockIcon width={18} height={18} />
                      <Text style={styles.sessionInfoLabel}>توقيت الجلسة</Text>
                    </View>
                    <Text style={styles.sessionInfoValue}>{displayTime}</Text>
                  </View>
                  <View style={styles.sessionInfoDetailItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <SettingIconSelected width={18} height={18} />
                      <Text style={styles.sessionInfoLabel}>المدة</Text>
                    </View>
                    <Text style={styles.sessionInfoValue}>{calculateDuration(item?.SchedulingTime, item?.SchedulingEndTime)}</Text>
                  </View>
                </View>
              </View>
            )
          })
        }

        <View style={{ width: "100%", backgroundColor: "#e4f1ef", marginVertical: 16, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: "flex-start" }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>المرضى المراد حجز الجلسة لهم</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <CommonRadioButton
            selected={selected === 'myself'}
            onPress={() => setSelected('myself')}
            label="نفسي"
            style={{ width: "48%", }}
          />
          <CommonRadioButton
            selected={selected === 'other'}
            onPress={() => setSelected('other')}
            label="للغير"
            style={{ width: "48%" }}
          />
        </View>
        <View style={{ width: "100%", alignItems: "flex-start" }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center', paddingVertical: 16 }}>اسمك</Text>
          <TextInput
            style={{ width: "100%", color: "#000", height: 50, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 10, textAlign: "right" }}
            placeholder="اسمك"
            value={user?.FullnameSlang}
            editable={false}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center', paddingVertical: 16 }}>رقم الجوال</Text>
          <PhoneNumberInput
            value={defaultPhoneNumber}
            onChangePhoneNumber={handlePhoneNumberChange}
            placeholder={t('mobile_number')}
            errorText={t('mobile_number_not_valid')}
            defaultCountry={defaultCountryCode}
            editable={false}
          />
        </View>
        <View style={{ width: "100%", backgroundColor: "#e4f1ef", marginVertical: 16, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: "flex-start" }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>وصف الشكوى المرضية (إختياري)</Text>
        </View>
        <View style={{ width: "100%", alignItems: "flex-start", marginBottom: 24 }}>
          <TextInput
            style={{
              width: "100%",
              minHeight: 80,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              textAlign: "right",
              fontSize: 15,
              backgroundColor: "#fff"
            }}
            placeholder="الوصف النصي"
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'left', paddingVertical: 16 }}>
          صف شكواك بالتسجيل الصوتي (إختياري)
        </Text>

        <View style={{
          width: "100%",
          backgroundColor: "#f6fafd",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#e0e0e0",
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          marginBottom: 12
        }}>
          {/* Fake audio player UI */}
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16, backgroundColor: "#e0e0e0",
              alignItems: "center", justifyContent: "center", marginRight: 8
            }}>
              <Text style={{ fontSize: 18, color: "#888" }}>▶</Text>
            </View>
            <Text style={{ color: "#888", fontSize: 14 }}>0:00 / 0:00</Text>
            <View style={{ flex: 1 }} />
            <View style={{
              width: 24, height: 24, borderRadius: 12, backgroundColor: "#e0e0e0",
              alignItems: "center", justifyContent: "center", marginLeft: 8
            }}>
              <Text style={{ fontSize: 16, color: "#888" }}>⋮</Text>
            </View>
          </View>
        </View>

        <View style={{ width: "100%", alignItems: "flex-end" }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#e4f1ef",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 18,
              marginTop: 4
            }}
          // onPress={handleStartRecording}
          >
            {/* Use your own MicrophoneIcon component if available */}
            <Text style={{ fontSize: 18, color: "#23a2a4", marginLeft: 6 }}>🎤</Text>
            <Text style={{ color: "#23a2a4", fontWeight: "bold", fontSize: 16 }}>بدء التسجيل</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>}


      {/* Buttons */}
      <View style={styles.BottomContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tagsContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  doctorTagContainer: {
    position: 'relative',
  },
  doctorTag: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 4,
    minWidth: 180,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTag: {
    borderColor: '#23a2a4',
    backgroundColor: '#23a2a4',
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  doctorInfoCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'left',
  },
  serviceName: {
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
  },
  separator: {
    width: 8,
  },
  detailsCard: {
    backgroundColor: '#F6FAF9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#e4f1ef',
    paddingHorizontal: 10,
  },
  detailsHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectedServiceCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#23a2a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedServiceCircleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedServiceText: {
    fontSize: 15,
    color: '#23a2a4',
    fontWeight: 'bold',
  },
  sessionInfoTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  sessionInfoDetailsContainer: {
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  sessionInfoDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfoLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
    marginLeft: 2,
  },
  sessionInfoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
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
    width: "64%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: '#179c8e',
  },
  backButtonText: {
    color: '#179c8e',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  disabledNextButton: {
    opacity: 0.5,
  },
  arrowIndicator: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  arrowText: {
    fontSize: 20,
    color: '#23a2a4',
    fontWeight: 'bold',
  },
  arrowIndicatorSimple: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
});

export default ReviewOrder; 