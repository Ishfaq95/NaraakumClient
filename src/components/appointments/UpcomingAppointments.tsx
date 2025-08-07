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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appointmentService, Appointment } from '../../services/api/appointmentService';
import { styles } from './styles';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import NoAppointmentsIcon from '../../assets/icons/NoAppointmentsIcon';
import RemoteAppointmentCard from './RemoteAppointmentCard';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import CustomBottomSheet from '../common/CustomBottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { generateVisitHistoryPDF } from '../../components/GeneratePDF/VisitConsultantLog';
import { profileService } from '../../services/api/ProfileService';

const PAGE_SIZE = 10;

interface UpcomingAppointmentsProps {
  userId: string;
  onJoinMeeting: (meetingId: string) => void;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ userId, onJoinMeeting }) => {
  const { t } = useTranslation();
  const isScreenFocused = useIsFocused();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [visitHistoryData, setVisitHistoryData] = useState<any>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

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
          setIsBottomSheetVisible(true);
      }
    } catch (error) {
      console.error('Error getting visit main record details:', error);
    } finally {
      setIsLoading(false);
    }
  }



  const fetchAppointments = async (page: number, append: boolean = false) => {
    if (!userId || isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await appointmentService.getAppointmentList({
        UserloginInfoId: userId,
        OrderMainStatus: '+1',
        OrderStatusId: null,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      });

      if (append) {
        setAppointments(prev => [...prev, ...response.UserOrders]);
      } else {
        setAppointments(response.UserOrders);
      }

      if(response?.UserOrders?.length > 0 && response?.TotalRecord > PAGE_SIZE*page){
        setIsLoadingMore(true);
      }else{
        setIsLoadingMore(false);
      }

      setCurrentPage(page);
    } catch (error) {
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
    console.log(appointment);
  };
  const onRating = (appointment: Appointment) => {
    console.log(appointment);
  };
  const onMoreIcon = (appointment: Appointment) => {
    console.log(appointment);
  };

  const renderItem = useCallback(({ item }: { item: Appointment }) => (
    <RemoteAppointmentCard
      appointment={item}
      onJoinMeeting={onJoinMeeting}
      isCallEnabled={false}
      onPrescription={() => onPrescription(item)}
      onNewAppointment={onNewAppointment}
      onRating={onRating}
      onMoreIcon={onMoreIcon}
    />
  ), [onJoinMeeting, onPrescription, onNewAppointment, onRating, onMoreIcon]);
  
  if(isLoading && appointments.length === 0){
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
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        height="90%"
        showHandle={false}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5',borderTopLeftRadius: 10,borderTopRightRadius: 10 }}>
          {/* Header */}
          <View style={{ height: 50, backgroundColor: "#e4f1ef", justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',borderTopLeftRadius: 10,borderTopRightRadius: 10, paddingHorizontal: 16 }}>
            <Text style={[globalTextStyles.bodyLarge, { fontWeight: '600', color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }]}>
              {visitHistoryData?.data?.HospitalInfo?.[0]?.CatCategoryId === 42 ? 'سجل الجلسة' : 'سجل الزيارة'}
            </Text>
            <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)}>
              <AntDesign name="close" size={24} color="#979e9eff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{flex:1,paddingHorizontal:16}}>
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
    </>
  );
};

export default UpcomingAppointments; 