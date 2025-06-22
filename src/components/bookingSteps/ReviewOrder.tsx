import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import ClockIcon from '../../assets/icons/ClockIcon';
import SettingIconSelected from '../../assets/icons/SettingIconSelected';
import { useTranslation } from 'react-i18next';
import CommonRadioButton from '../../components/common/CommonRadioButton';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import { countries } from '../../utils/countryData';
import { setApiResponse } from '../../shared/redux/reducers/bookingReducer';
import { bookingService } from '../../services/api/BookingService';
import { generatePayloadforOrderMainBeforePayment } from '../../shared/services/service';
import { useDispatch, useSelector } from 'react-redux';

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
  const selectedDoctor = DoctorsNameArray[selectedIndex];
  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const apiResponse = useSelector((state: any) => state.root.booking.apiResponse);
  const dispatch = useDispatch();
  const renderDoctorTag = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.doctorTag, selectedIndex === index && styles.selectedTag]}
      onPress={() => setSelectedIndex(index)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.doctorImage} />
      <View style={styles.doctorInfoCol}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.serviceName}>{item.service}</Text>
      </View>
    </TouchableOpacity>
  );

  const createOrderMainBeforePayment = async () => {
    const payload = {
      "OrderId":apiResponse[0].OrderId,
      "CatPlatformId": 1,
      "OrderDetail": generatePayloadforOrderMainBeforePayment(CardArray,true)
    }

    console.log("payload===>",payload)

    const response = await bookingService.updateOrderMainBeforePayment(payload);
    console.log("response===>",response.Data)
    // dispatch(setApiResponse(response.Data))
    // onPressNext();
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

  return (
    <View style={styles.container}>
      <View style={{ height: 100 }}>
        {/* Doctor tags */}
        <FlatList
          data={DoctorsNameArray}
          renderItem={renderDoctorTag}
          keyExtractor={(item, index) => `doctor-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      <ScrollView style={{ flex: 1, marginBottom: 60 }}>
        {/* Details card for selected doctor */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsHeaderText}>الخدمات المختارة (1)</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>✎</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectedServiceRow}>
            <Text style={styles.selectedServiceText}>{selectedDoctor.service}</Text>
            <View style={styles.selectedServiceCircle}><Text style={styles.selectedServiceCircleText}>1</Text></View>
          </View>
          {/* Session info with icons */}
          <View style={styles.sessionInfoDetailsContainer}>
            <View style={styles.sessionInfoDetailItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CalendarIcon width={18} height={18} />
                <Text style={styles.sessionInfoLabel}>تاريخ الجلسة</Text>
              </View>
              <Text style={styles.sessionInfoValue}>{selectedDoctor.date}</Text>
            </View>
            <View style={styles.sessionInfoDetailItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ClockIcon width={18} height={18} />
                <Text style={styles.sessionInfoLabel}>توقيت الجلسة</Text>
              </View>
              <Text style={styles.sessionInfoValue}>{selectedDoctor.time}</Text>
            </View>
            <View style={styles.sessionInfoDetailItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <SettingIconSelected width={18} height={18} />
                <Text style={styles.sessionInfoLabel}>المدة</Text>
              </View>
              <Text style={styles.sessionInfoValue}>{selectedDoctor.duration}</Text>
            </View>
          </View>
        </View>

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
            style={{ width: "100%", height: 50, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 10, textAlign: "right" }}
            placeholder="اسمك"
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center', paddingVertical: 16 }}>رقم الجوال</Text>
          <PhoneNumberInput
            value={mobileNumber}
            onChangePhoneNumber={handlePhoneNumberChange}
            placeholder={t('mobile_number')}
            errorText={t('mobile_number_not_valid')}
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
      </ScrollView>

      {/* Buttons */}
      <View style={styles.BottomContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, styles.disabledNextButton]}
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
    backgroundColor: 'rgba(35,162,164,0.08)',
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
    textAlign: 'right',
  },
  serviceName: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
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
});

export default ReviewOrder; 