import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appointmentService, Appointment } from '../../services/api/appointmentService';
import { styles } from '../appointments/styles';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import NoAppointmentsIcon from '../../assets/icons/NoAppointmentsIcon';
import RemoteAppointmentCard from './RemoteAppointmentCard';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import CustomBottomSheet from '../common/CustomBottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { generateVisitHistoryPDF } from '../../components/GeneratePDF/VisitConsultantLog';
import { profileService } from '../../services/api/ProfileService';
import { ROUTES } from '../../shared/utils/routes';

const PAGE_SIZE = 10;

interface CurrentAppointmentsProps {
  userId: string;
  onJoinMeeting: (meetingId: string) => void;
}

const CurrentAppointments: React.FC<CurrentAppointmentsProps> = ({ userId, onJoinMeeting }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const isScreenFocused = useIsFocused();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const enabledAppointmentsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<any>(null);
  const [visitHistoryData, setVisitHistoryData] = useState<any>(null);
  const [isPrescriptionVisible, setIsPrescriptionVisible] = useState(false);
  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [medicalCenterRating, setMedicalCenterRating] = useState(0);
  const [timingRating, setTimingRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [comment, setComment] = useState('');
  const ratingScrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const getVisitMainRecordDetails = async (item: any) => {
    try {
      setIsLoading(true);
      const payload = {
        "VisitMainId": item?.VisitMainId,
      }
      const response = await profileService.getVisitMainRecordDetails(payload);
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        setVisitHistoryData({
          data: response,
          patientName: item?.PatientFullNameSLang || 'مريض'
        });
        setIsPrescriptionVisible(true);
      }
    } catch (error) {
      console.error('Error getting visit main record details:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const checkTimeCondition = useCallback((appointment: Appointment) => {
    const now = moment();
    const appointmentDate = moment.utc(appointment?.SchedulingDate).local();
    const startTime = moment.utc(appointment?.SchedulingTime, 'HH:mm').local();
    const endTime = moment.utc(appointment?.SchedulingEndTime, 'HH:mm').local();

    startTime.set({
      year: appointmentDate.year(),
      month: appointmentDate.month(),
      date: appointmentDate.date()
    });
    endTime.set({
      year: appointmentDate.year(),
      month: appointmentDate.month(),
      date: appointmentDate.date()
    });

    return now.isSameOrAfter(startTime) &&
      now.isBefore(endTime) &&
      now.isSame(appointmentDate, 'day');
  }, []);

  const isAppointmentEnabled = useCallback((appointment: Appointment) => {
    return enabledAppointmentsRef.current.has(`${appointment.OrderId}-${appointment.OrderDetailId}`);
  }, []);

  const fetchAppointments = async (page: number, append: boolean = false) => {
    if (!userId || isLoading) return;

    try {
      setIsLoading(true);
      const response = await appointmentService.getAppointmentList({
        UserloginInfoId: userId,
        OrderMainStatus: '0',
        OrderStatusId: null,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      });

      if (append) {
        setAppointments(prev => [...prev, ...response.UserOrders]);
      } else {
        setAppointments(response.UserOrders);
      }

      if (response?.UserOrders?.length > 0 && response?.TotalRecord > PAGE_SIZE * page) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingMore(false);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching current appointments:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && isLoadingMore) {
      fetchAppointments(currentPage + 1, true);
    }
  };

  const refreshList = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      setCurrentPage(1);
      fetchAppointments(1);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments(1);
    }
  }, [userId]);

  useEffect(() => {
    if (isScreenFocused && appointments?.length > 0) {
      // Initial check
      const enabled = new Set<string>();
      appointments.forEach(appointment => {
        if (checkTimeCondition(appointment)) {
          enabled.add(`${appointment.OrderId}-${appointment.OrderDetailId}`);
        }
      });
      enabledAppointmentsRef.current = enabled;

      // Set up interval
      timerRef.current = setInterval(() => {
        if (!appointments?.length) {
          return;
        }
        const enabled = new Set<string>();
        let hasChanges = false;

        appointments.forEach(appointment => {
          const isEnabled = checkTimeCondition(appointment);
          const appointmentId = `${appointment.OrderId}-${appointment.OrderDetailId}`;

          if (isEnabled) {
            enabled.add(appointmentId);
          }

          // Check if the enabled state has changed
          if (isEnabled !== enabledAppointmentsRef.current.has(appointmentId)) {
            hasChanges = true;
          }
        });

        // Only update if there are actual changes
        if (hasChanges) {
          enabledAppointmentsRef.current = enabled;
          // Force a re-render of the FlatList
          setAppointments(prev => [...prev]);
        }
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isScreenFocused, appointments, checkTimeCondition]);

  // Keyboard listeners for rating bottom sheet
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Scroll to comment section when keyboard appears
      setTimeout(() => {
        ratingScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  };

  const onPrescription = (appointment: Appointment) => {
    getVisitMainRecordDetails(appointment);
  };
  const onNewAppointment = (appointment: Appointment) => {
    navigation.navigate(ROUTES.AppNavigator, {
      screen: ROUTES.HomeStack,
      params: {
          screen: ROUTES.Services,
      }
  });
  };
  const onRating = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setMedicalCenterRating(0); // Reset ratings when opening
    setTimingRating(0);
    setStaffRating(0);
    setComment(''); // Reset comment
    setIsRatingVisible(true);
    console.log(appointment);
  };

  const handleCommentFocus = () => {
    // Immediate scroll when focus starts
    ratingScrollViewRef.current?.scrollToEnd({ animated: true });

    // Multiple scroll attempts to ensure visibility
    setTimeout(() => {
      ratingScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    setTimeout(() => {
      ratingScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);

    setTimeout(() => {
      ratingScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 400);
  };

  const handleMedicalCenterStarPress = (starIndex: number) => {
    setMedicalCenterRating(starIndex + 1);
  };

  const handleTimingStarPress = (starIndex: number) => {
    setTimingRating(starIndex + 1);
  };

  const handleStaffStarPress = (starIndex: number) => {
    setStaffRating(starIndex + 1);
  };

  const handleSubmitRating = async () => {
    console.log('selectedAppointment', selectedAppointment);
    const payload = {
      "UserloginInfoId": userId,
      "Comment": comment,
      "OrderId": selectedAppointment?.OrderId,
      "RelationOrderAndOrganizationCategoryId": selectedAppointment?.RelationOrderAndOrganizationCategoryId,
      "OrganizationId": selectedAppointment?.OrganizationId,
      "Rating": [
        { "TargetId": selectedAppointment?.ServiceProviderId, "CatRatingTypeId": 1, "RatingValue": medicalCenterRating },
        { "TargetId": selectedAppointment?.ServiceProviderId, "CatRatingTypeId": 2, "RatingValue": timingRating },
        { "TargetId": selectedAppointment?.ServiceProviderId, "CatRatingTypeId": 3, "RatingValue": staffRating }],
      "VisitMainId": selectedAppointment?.VisitMainId,
      "TaskMainId": selectedAppointment?.TaskId
    }

    const response = await profileService.submitRating(payload);
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setMedicalCenterRating(0);
      setTimingRating(0);
      setStaffRating(0);
      setComment('');

      Alert.alert('تم تحديث التقييم', 'تم تحديث التقييم بنجاح', [
        {
          text: 'موافق',
          onPress: () => {
            setIsRatingVisible(false);
          }
        }
      ]);
    }
    // Here you can add API call to submit the ratings

  };
  const onMoreIcon = (appointment: Appointment) => {
    console.log(appointment);
  };

  const renderItem = useCallback(({ item }: { item: Appointment }) => (
    <RemoteAppointmentCard
      appointment={item}
      onJoinMeeting={onJoinMeeting}
      isCallEnabled={isAppointmentEnabled(item)}
      onPrescription={() => onPrescription(item)}
      onNewAppointment={onNewAppointment}
      onRating={onRating}
      onMoreIcon={onMoreIcon}
    />
  ), [onJoinMeeting, isAppointmentEnabled, onPrescription, onNewAppointment, onRating, onMoreIcon]);

  if (isLoading && appointments?.length === 0) {
    return (
      <View style={styles.emptyContentContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.OrderId}-${item.OrderDetailId}`}
        contentContainerStyle={styles.contentContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshList}
            colors={['#008080']}
          />
        }
        removeClippedSubviews={true}
        ListEmptyComponent={() => (
          <View style={styles.emptyContentContainer}>
            <NoAppointmentsIcon />
            <Text style={styles.text}>{t('no_appointments')}</Text>
          </View>
        )}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
      <CustomBottomSheet
        visible={isPrescriptionVisible}
        onClose={() => setIsPrescriptionVisible(false)}
        height="90%"
        showHandle={false}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          {/* Header */}
          <View style={{ height: 50, backgroundColor: "#e4f1ef", justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingHorizontal: 16 }}>
            <Text style={[globalTextStyles.bodyLarge, { fontWeight: '600', color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }]}>
              {visitHistoryData?.data?.HospitalInfo?.[0]?.CatCategoryId === 42 ? 'سجل الجلسة' : 'سجل الزيارة'}
            </Text>
            <TouchableOpacity onPress={() => setIsPrescriptionVisible(false)}>
              <AntDesign name="close" size={24} color="#979e9eff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              {/* Patient Name */}
              <View style={{ paddingVertical: 10, alignItems: 'flex-start' }}>
                <Text style={[globalTextStyles.h3, { color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }]}>
                  {visitHistoryData?.patientName || 'مريض'}
                </Text>
              </View>

              {/* Hospital Information */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>المستشفى</Text>
                </View>
                <View style={styles.sectionBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>المستشفى</Text>
                    <Text style={styles.infoValue}>{visitHistoryData?.data?.HospitalInfo?.[0]?.TitleSlang || ''}</Text>
                  </View>
                  <View style={[styles.infoRow, { backgroundColor: '#f4fdfe' }]}>
                    <Text style={styles.infoLabel}>مقدم الرعاية</Text>
                    <Text style={styles.infoValue}>{visitHistoryData?.data?.HospitalInfo?.[0]?.FullnameSlang || ''}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>رقم الطلب</Text>
                    <Text style={styles.infoValue}>{visitHistoryData?.data?.HospitalInfo?.[0]?.OrderId || ''}</Text>
                  </View>
                  <View style={[styles.infoRow, { backgroundColor: '#f4fdfe' }]}>
                    <Text style={styles.infoLabel}>
                      {visitHistoryData?.data?.HospitalInfo?.[0]?.CatCategoryId === 42 ? 'تاريخ الجلسة' : 'تاريخ الزيارة'}
                    </Text>
                    <Text style={styles.infoValue}>
                      {visitHistoryData?.data?.HospitalInfo?.[0]?.VisitDate ?
                        moment(visitHistoryData.data.HospitalInfo[0].VisitDate).locale('en').format('DD/MM/YYYY') : ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Patient Complaint */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>شكوى المريض</Text>
                </View>
                <View style={styles.sectionBody}>
                  <View style={[styles.articleContainer, { backgroundColor: '#f4fdfe' }]}>
                    <Text style={styles.articleTitle}>الشكوى الرئيسية "CC"</Text>
                    <Text style={styles.articleContent}>
                      {visitHistoryData?.data?.PatientComplaint?.[0]?.ChiefComplaint || ''}
                    </Text>
                  </View>
                  <View style={styles.articleContainer}>
                    <Text style={styles.articleTitle}>وصف الشكاوى</Text>
                    <Text style={styles.articleContent}>
                      {visitHistoryData?.data?.PatientComplaint?.[0]?.PresentIllness || ''}
                    </Text>
                  </View>
                  <View style={[styles.articleContainer, { backgroundColor: '#f4fdfe' }]}>
                    <Text style={styles.articleTitle}>مدة الشكاوى</Text>
                    <Text style={styles.articleContent}>
                      {visitHistoryData?.data?.PatientComplaint?.[0]?.DurationOfComplaint > 0 ?
                        `${visitHistoryData.data.PatientComplaint[0].DurationOfComplaint} يوم` : ''}
                    </Text>
                  </View>
                  <View style={styles.articleContainer}>
                    <Text style={styles.articleTitle}>الشكاوى الأخرى</Text>
                    <Text style={styles.articleContent}>
                      {visitHistoryData?.data?.PatientComplaint?.[0]?.OtherComplaint || ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Patient History */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>سجل المريض</Text>
                </View>
                <View style={styles.sectionBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>السجل الطبي الماضي</Text>
                    <Text style={styles.infoValue}>
                      {visitHistoryData?.data?.PatientHistory?.[0]?.PMH?.replace(/#/g, ', ') || ''}
                    </Text>
                  </View>
                  <View style={[styles.infoRow, { backgroundColor: '#f4fdfe' }]}>
                    <Text style={styles.infoLabel}>السجل الجراحي الماضي</Text>
                    <Text style={styles.infoValue}>
                      {visitHistoryData?.data?.PatientHistory?.[0]?.PSH?.replace(/#/g, ', ') || ''}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>حساسية</Text>
                    <Text style={styles.infoValue}>
                      {visitHistoryData?.data?.PatientHistory?.[0]?.Allergy?.replace(/#/g, ', ') || ''}
                    </Text>
                  </View>
                  <View style={[styles.infoRow, { backgroundColor: '#f4fdfe' }]}>
                    <Text style={styles.infoLabel}>الأدوية الحالية</Text>
                    <Text style={styles.infoValue}>
                      {visitHistoryData?.data?.PatientHistory?.[0]?.CurrentMeds?.replace(/#/g, ', ') || ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Patient Assessment */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>تقييم المريض</Text>
                </View>
                <View style={styles.sectionBody}>
                  {/* Vital Signs */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>العلامات الحيوية</Text>
                    <View style={styles.vitalSignsContainer}>
                      <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>Tem</Text>
                        <Text style={styles.vitalSignValue}>
                          {visitHistoryData?.data?.PatientAssessment?.[0]?.VitalSigns?.[0]?.Tem || ''}
                        </Text>
                      </View>
                      <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>H/R</Text>
                        <Text style={styles.vitalSignValue}>
                          {visitHistoryData?.data?.PatientAssessment?.[0]?.VitalSigns?.[0]?.HR || ''}
                        </Text>
                      </View>
                      <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>P4 02</Text>
                        <Text style={styles.vitalSignValue}>
                          {visitHistoryData?.data?.PatientAssessment?.[0]?.VitalSigns?.[0]?.P4O2 || ''}
                        </Text>
                      </View>
                      <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>R/R</Text>
                        <Text style={styles.vitalSignValue}>
                          {visitHistoryData?.data?.PatientAssessment?.[0]?.VitalSigns?.[0]?.RR || ''}
                        </Text>
                      </View>
                      <View style={styles.vitalSignItem}>
                        <Text style={styles.vitalSignLabel}>BP</Text>
                        <Text style={styles.vitalSignValue}>
                          {visitHistoryData?.data?.PatientAssessment?.[0]?.VitalSigns?.[0]?.Bp || ''}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* O/E */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>O/E</Text>
                    <View style={styles.oeContainer}>
                      {visitHistoryData?.data?.PatientAssessment?.[0]?.OE?.length > 0 ? (
                        visitHistoryData.data.PatientAssessment[0].OE
                          .sort((a: any, b: any) => a.Title.localeCompare(b.Title))
                          .map((oe: any, index: number) => (
                            <View key={index} style={styles.oeItem}>
                              <Text style={styles.oeTitle}>{oe.Title}</Text>
                              <Text style={styles.oeContent}>
                                {oe.BodyAnatomyTitle}: {oe.InputValue}
                              </Text>
                            </View>
                          ))
                      ) : (
                        <Text style={styles.noDataText}>لا توجد بيانات</Text>
                      )}
                    </View>
                  </View>

                  {/* Diagnosis */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>DX</Text>
                    <View style={styles.diagnosisContainer}>
                      {visitHistoryData?.data?.PatientAssessment?.[0]?.Diagnosis?.length > 0 ? (
                        visitHistoryData.data.PatientAssessment[0].Diagnosis.map((dx: any, index: number) => (
                          <View key={index} style={styles.diagnosisItem}>
                            <Text style={styles.diagnosisType}>
                              {dx.CatDxType === 1 ? 'Provisional Dx' : 'Differential Dx'}
                            </Text>
                            <Text style={styles.diagnosisSpecialty}>{dx.DiagnosisSpecialtyTitle}</Text>
                            {dx.Detail?.map((detail: any, detailIndex: number) => (
                              <View key={detailIndex} style={styles.diagnosisDetail}>
                                <Text style={styles.diagnosisCode}>{detail.Code}:</Text>
                                <Text style={styles.diagnosisText}>{detail.Diagnosis}</Text>
                              </View>
                            ))}
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>لا توجد تشخيصات</Text>
                      )}
                    </View>
                  </View>

                  {/* Lab/X-Ray */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>المختبر والأشعة</Text>
                    <View style={styles.labContainer}>
                      {visitHistoryData?.data?.PatientAssessment?.[0]?.LabXRays?.length > 0 ? (
                        visitHistoryData.data.PatientAssessment[0].LabXRays.map((lab: any, index: number) => (
                          <View key={index} style={styles.labItem}>
                            <Text style={styles.labTitle}>{lab.FileTypeTitleSlang}</Text>
                            <Text style={styles.labType}>File Type: {lab.FileTypeTitleSlang}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>لا توجد ملفات</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Treatment Plan */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>الخطة العلاجية</Text>
                </View>
                <View style={styles.sectionBody}>
                  {/* Procedures */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>الإجراءات</Text>
                    <View style={styles.procedureContainer}>
                      <View style={styles.procedureRow}>
                        <View style={styles.procedureColumn}>
                          <Text style={styles.procedureLabel}>الإجراء</Text>
                          <Text style={styles.procedureValue}>
                            {visitHistoryData?.data?.TreatmentPlan?.[0]?.Procedure?.[0]?.Procedurees || ''}
                          </Text>
                        </View>
                        <View style={styles.procedureColumn}>
                          <Text style={styles.procedureLabel}>التعليق</Text>
                          <Text style={styles.procedureValue}>
                            {visitHistoryData?.data?.TreatmentPlan?.[0]?.Procedure?.[0]?.Comments || ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Medicines */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>وصفة طبية</Text>
                    <View style={styles.medicineContainer}>
                      {visitHistoryData?.data?.TreatmentPlan?.[0]?.Medicines?.length > 0 ? (
                        visitHistoryData.data.TreatmentPlan[0].Medicines.map((medicine: any, index: number) => (
                          <View key={index} style={styles.medicineItem}>
                            <View style={styles.medicineRow}>
                              <Text style={styles.medicineLabel}>اسم الدواء:</Text>
                              <Text style={styles.medicineValue}>{medicine.MedicineName}</Text>
                              <Text style={styles.medicineLabel}>نوع الدواء:</Text>
                              <Text style={styles.medicineValue}>{medicine.Title}</Text>
                            </View>
                            <View style={styles.medicineRow}>
                              <Text style={styles.medicineLabel}>المدة:</Text>
                              <Text style={styles.medicineValue}>{medicine.Duration} {medicine.TimeUnitSlang}</Text>
                              <Text style={styles.medicineLabel}>الجرعة:</Text>
                              <Text style={styles.medicineValue}>{medicine.Dose} {medicine.Unit}</Text>
                            </View>
                            <View style={styles.medicineRow}>
                              <Text style={styles.medicineLabel}>التكرار:</Text>
                              <Text style={styles.medicineValue}>{medicine.Frequency}</Text>
                              <Text style={styles.medicineLabel}>الكمية:</Text>
                              <Text style={styles.medicineValue}>{medicine.Quantity}</Text>
                            </View>
                            {medicine.Description && (
                              <View style={styles.medicineRow}>
                                <Text style={styles.medicineLabel}>الوصف:</Text>
                                <Text style={styles.medicineValue}>{medicine.Description}</Text>
                              </View>
                            )}
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>لا توجد أدوية</Text>
                      )}
                    </View>
                  </View>

                  {/* Patient Instructions */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>تعليمات المريض</Text>
                    <Text style={styles.instructionText}>
                      {visitHistoryData?.data?.TreatmentPlan?.[0]?.Notes?.[0]?.Instructions || ''}
                    </Text>
                  </View>

                  {/* Added Services */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>خدمة جديدة</Text>
                    <View style={styles.serviceContainer}>
                      {visitHistoryData?.data?.AddedService?.length > 0 ? (
                        visitHistoryData.data.AddedService.map((service: any, index: number) => {
                          let serviceName = service.TitleSlang;
                          if (service.CatcategoryId === '42' || service.CatcategoryId === '41') {
                            const consultationType = service.CatcategoryId === '42' ? 'استشارة عن بعد' : 'استشارة فيديو';
                            serviceName = `${consultationType} / ${serviceName}`;
                          }
                          if (service.SpecialtyTitleSlang) {
                            serviceName += ` (${service.SpecialtyTitleSlang})`;
                          }
                          return (
                            <View key={index} style={styles.serviceItem}>
                              <Text style={styles.serviceName}>{serviceName}</Text>
                              <Text style={styles.serviceQuantity}>الكمية: {service.Quantity}</Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text style={styles.noDataText}>لا توجد خدمات إضافية</Text>
                      )}
                    </View>
                  </View>

                  {/* Referral */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>التحويل/ الاستشارة</Text>
                    <View style={styles.referralContainer}>
                      <View style={styles.referralItem}>
                        <Text style={styles.referralLabel}>التخصص</Text>
                        <Text style={styles.referralValue}>
                          {visitHistoryData?.data?.TreatmentPlan?.[0]?.Refer?.[0]?.Title || ''}
                        </Text>
                      </View>
                      <View style={styles.referralItem}>
                        <Text style={styles.referralLabel}>المنظمة</Text>
                        <Text style={styles.referralValue}>
                          {visitHistoryData?.data?.TreatmentPlan?.[0]?.Refer?.[0]?.Organization || ''}
                        </Text>
                      </View>
                      <View style={styles.referralItem}>
                        <Text style={styles.referralLabel}>سبب الإحالة</Text>
                        <Text style={styles.referralValue}>
                          {visitHistoryData?.data?.TreatmentPlan?.[0]?.Refer?.[0]?.ReferTo || ''}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Notes */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>ملاحظات</Text>
                    <Text style={styles.notesText}>
                      {visitHistoryData?.data?.TreatmentPlan?.[0]?.Notes?.[0]?.Notes || ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Download Button */}
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={async () => {
                    if (visitHistoryData) {
                      const visitHistoryDataForPDF = {
                        HospitalInfo: visitHistoryData.data?.HospitalInfo || [],
                        PatientComplaint: visitHistoryData.data?.PatientComplaint || [],
                        PatientHistory: visitHistoryData.data?.PatientHistory || [],
                        PatientAssessment: visitHistoryData.data?.PatientAssessment || [],
                        TreatmentPlan: visitHistoryData.data?.TreatmentPlan || [],
                        AddedService: visitHistoryData.data?.AddedService || [],
                        PatientName: visitHistoryData.patientName
                      };
                      await generateVisitHistoryPDF(visitHistoryDataForPDF);
                    }
                  }}
                >
                  <Text style={styles.downloadButtonText}>تحميل PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </CustomBottomSheet>

      <CustomBottomSheet
        visible={isRatingVisible}
        onClose={() => setIsRatingVisible(false)}
        height="80%"
        showHandle={false}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          {/* Header */}
          <View style={{ height: 50, backgroundColor: "#e4f1ef", justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingHorizontal: 16 }}>
            <Text style={[globalTextStyles.bodyLarge, { fontWeight: '600', color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }]}>
              {'إستبيان مدى رضاك عن الخدمة'}
            </Text>
            <TouchableOpacity onPress={() => setIsRatingVisible(false)}>
              <AntDesign name="close" size={24} color="#979e9eff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={ratingScrollViewRef}
            style={{ flexGrow: 1, flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: keyboardHeight }}
          >
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <View style={{ flex: 1 }}>
                <View style={{ height: 50, backgroundColor: '#e4f1ef', marginTop: 10, borderRadius: 10, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }}>تقييم المركز الطبي</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', textAlign: 'center', marginTop: 10, fontFamily: CAIRO_FONT_FAMILY.bold }}>بشكل عام ما مدى رضاكم عن الخدمة ؟</Text>

                {/* Star Rating */}
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4].map((starIndex) => (
                      <TouchableOpacity
                        key={starIndex}
                        onPress={() => handleMedicalCenterStarPress(starIndex)}
                        style={{ marginHorizontal: 5 }}
                      >
                        <AntDesign
                          name={starIndex < medicalCenterRating ? "star" : "staro"}
                          size={40}
                          color={starIndex < medicalCenterRating ? "#23a2a4" : "#D3D3D3"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ height: 1, width: '100%', backgroundColor: '#ddd', marginTop: 30 }} />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', textAlign: 'center', marginTop: 10, fontFamily: CAIRO_FONT_FAMILY.bold }}>كيف كان التوقيت المتعلق بتقديم الخدمة ووصولها اليكم ؟</Text>

                {/* Star Rating */}
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4].map((starIndex) => (
                      <TouchableOpacity
                        key={starIndex}
                        onPress={() => handleTimingStarPress(starIndex)}
                        style={{ marginHorizontal: 5 }}
                      >
                        <AntDesign
                          name={starIndex < timingRating ? "star" : "staro"}
                          size={40}
                          color={starIndex < timingRating ? "#23a2a4" : "#D3D3D3"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ height: 1, width: '100%', backgroundColor: '#ddd', marginTop: 30 }} />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ height: 50, backgroundColor: '#e4f1ef', marginTop: 10, borderRadius: 10, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }}>تقييم الطبيب المعالج / الطاقم الطبي</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', textAlign: 'center', marginTop: 10, fontFamily: CAIRO_FONT_FAMILY.bold }}>ما مدى راحتك مع الطاقم الطبي/الأخصائي/التمريض ؟</Text>

                {/* Star Rating */}
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4].map((starIndex) => (
                      <TouchableOpacity
                        key={starIndex}
                        onPress={() => handleStaffStarPress(starIndex)}
                        style={{ marginHorizontal: 5 }}
                      >
                        <AntDesign
                          name={starIndex < staffRating ? "star" : "staro"}
                          size={40}
                          color={starIndex < staffRating ? "#23a2a4" : "#D3D3D3"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ height: 1, width: '100%', backgroundColor: '#ddd', marginTop: 30 }} />
                </View>
              </View>

              {/* Comment Section */}
              <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#000',
                  textAlign: 'center',
                  marginBottom: 10,
                  fontFamily: CAIRO_FONT_FAMILY.bold
                }}>
                  تعليقات إضافية (اختياري)
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    textAlignVertical: 'top',
                    minHeight: 100,
                    fontFamily: CAIRO_FONT_FAMILY.regular,
                    fontSize: 14,
                    color: '#333',
                    textAlign: 'right'
                  }}
                  placeholder="اكتب تعليقك هنا..."
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  onFocus={handleCommentFocus}
                />
              </View>

              {/* Submit Button */}
              <View style={{ marginTop: 30, paddingHorizontal: 20, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: (medicalCenterRating > 0 || timingRating > 0 || staffRating > 0) ? '#23a2a4' : '#D3D3D3',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: (medicalCenterRating > 0 || timingRating > 0 || staffRating > 0) ? 1 : 0.6
                  }}
                  onPress={handleSubmitRating}
                  disabled={(medicalCenterRating === 0 && timingRating === 0 && staffRating === 0)}
                >
                  <Text style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold',
                    fontFamily: CAIRO_FONT_FAMILY.bold
                  }}>
                    إرسال التقييم
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </CustomBottomSheet>
    </>

  );
};

export default CurrentAppointments; 