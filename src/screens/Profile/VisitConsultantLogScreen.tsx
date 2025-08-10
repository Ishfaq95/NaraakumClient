import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ScrollView } from 'react-native'
import Header from '../../components/common/Header';
import React, { useCallback, useEffect, useState } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Dropdown from '../../components/common/Dropdown';
import VisitConsultantLogItemRender from './profileComponents/VisitConsultantLogItemRender';
import FullScreenLoader from '../../components/FullScreenLoader';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { generatePrescriptionPDF, generateVisitHistoryPDF } from '../../components/GeneratePDF/VisitConsultantLog';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import moment from 'moment';

const VisitConsultantLogScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const user = useSelector((state: RootState) => state.root.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const [patientList, setPatientList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [visitConsultantLog, setVisitConsultantLog] = useState([]);
  const [filteredVisitConsultantLog, setFilteredVisitConsultantLog] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [visitHistoryData, setVisitHistoryData] = useState<any>(null);
  useEffect(() => {
    getBeneficiaries();
    getVisitConsultantLog();
  }, []);

  const getVisitConsultantLog = async () => {
    setIsDataLoading(true);
    try {
      const payload = {
        "UserloginInfoId": user?.Id,
      }
      const response = await profileService.getVisitConsultantLog(payload);
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        setVisitConsultantLog(response?.Data || []);
      }
    } catch (error) {
      console.error('Error fetching visit consultant log:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

  const getBeneficiaries = async () => {
    setIsLoading(true);
    const payload = {
      "UserId": user?.Id,
    }
    const response = await profileService.getBeneficiaries(payload);

    if (response?.ResponseStatus?.STATUSCODE == 200) {
      const patients = response?.RefferalUserList?.map((item: any) => ({
        label: item.FullnameSlang,
        value: item.UserProfileinfoId
      }));
      setPatientList(patients);

      // Auto-select the first patient if available
      if (patients && patients.length > 0) {
        setSelectedPatient(patients[0].value);
      }
    }
    setIsLoading(false);
  }

  const getVisitMainRecordDetails = async (item: any, type: string) => {
    try {
      setIsLoading(true);
      const payload = {
        "VisitMainId": item?.Id,
      }
      const response = await profileService.getVisitMainRecordDetails(payload);
      if (response?.ResponseStatus?.STATUSCODE == 200) {
        if (type == 'medicine') {
          // Generate prescription PDF
          const prescriptionData = {
            HospitalInfo: response?.HospitalInfo || [],
            TreatmentPlan: response?.TreatmentPlan || [],
            PatientName: item?.PatientFullNameSLang || 'مريض'
          };
          
          await generatePrescriptionPDF(prescriptionData);
        } else {
          setVisitHistoryData({
            data: response,
            patientName: item?.PatientFullNameSLang || 'مريض'
          });
          setIsBottomSheetVisible(true);
        }
      }
    } catch (error) {
      console.error('Error getting visit main record details:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (selectedPatient && visitConsultantLog.length > 0) {
      filterVisitConsultantLog();
    }
  }, [selectedPatient,visitConsultantLog]);

  const filterVisitConsultantLog = () => {
    const filtered = visitConsultantLog.filter((item: any) => item.PatientUserProfileInfoId == selectedPatient);
    setFilteredVisitConsultantLog(filtered);
  }

  const onVisitDetails = (item: any) => {
    // @ts-ignore
    navigation.navigate(ROUTES.OrderDetailScreen, {OrderId:item?.OrderId})
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('visit_consultant_log')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const renderItem = useCallback(({ item }: any) => (
    <VisitConsultantLogItemRender item={item} getMedicine={(item: any) => getVisitMainRecordDetails(item,'medicine')} getVisitMainRecordDetails={(item: any) => getVisitMainRecordDetails(item,'visit')} onVisitDetails={(item: any) => onVisitDetails(item)} />
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ flex: 1, backgroundColor: '#e4f1ef', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Dropdown data={patientList} value={selectedPatient} onChange={(value: string | number) => setSelectedPatient(value.toString())} placeholder={t('select_patient')} />

        <View style={{ paddingHorizontal: 16, marginTop: 10, alignSelf:"flex-start" }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{`النتائج : (${filteredVisitConsultantLog.length})`}</Text>
      </View>
        <View style={styles.contentContainer}>
          {isDataLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[globalTextStyles.bodyMedium, { color: '#000', fontFamily: CAIRO_FONT_FAMILY.medium }]}>جاري التحميل...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredVisitConsultantLog}
              renderItem={renderItem}
              keyExtractor={(item: any) => item?.Id?.toString()}
              style={{ width: '100%', }}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={5}
              getItemLayout={(data, index) => ({
                length: 200, // Approximate height of each item
                offset: 200 * index,
                index,
              })}
              ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000', fontFamily: CAIRO_FONT_FAMILY.medium }]}>{t('no_addresses')}</Text>
              </View>}
            />
          )}
        </View>
      </View>

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
      <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 5,
    borderRadius: 10,
  },
  headerTitle: {
    ...globalTextStyles.h3,
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  // Bottom Sheet Styles
  sectionContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#32A3A4',
    alignItems: 'flex-start',
    padding: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  sectionBody: {
    padding: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.medium,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  articleContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  articleTitle: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  articleContent: {
    fontSize: 14,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  subSection: {
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 14,
    textAlign: 'left',
    paddingLeft: 10,
    marginBottom: 8,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  vitalSignsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  vitalSignItem: {
    alignItems: 'center',
    flex: 1,
  },
  vitalSignLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  vitalSignValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  oeContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  oeItem: {
    marginBottom: 8,
  },
  oeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#23a2a4',
    marginBottom: 3,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  oeContent: {
    fontSize: 13,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  diagnosisContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  diagnosisItem: {
    marginBottom: 10,
  },
  diagnosisType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#23a2a4',
    marginBottom: 5,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  diagnosisSpecialty: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  diagnosisDetail: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  diagnosisCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#23a2a4',
    marginRight: 5,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  diagnosisText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  labContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  labItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  labTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#23a2a4',
    marginBottom: 3,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  labType: {
    fontSize: 12,
    color: '#666',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  procedureContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  procedureRow: {
    flexDirection: 'row',
  },
  procedureColumn: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
  procedureLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  procedureValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  medicineContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  medicineItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  medicineRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  medicineLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#23a2a4',
    marginRight: 5,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  medicineValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  serviceContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  serviceItem: {
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#23a2a4',
    marginBottom: 3,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  serviceQuantity: {
    fontSize: 12,
    color: '#666',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  referralContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  referralItem: {
    marginBottom: 8,
  },
  referralLabel: {
    fontSize: 14,
    textAlign: 'left',
    paddingLeft: 10,
    marginBottom: 3,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  referralValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  downloadButton: {
    backgroundColor: '#23a2a4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
})

export default VisitConsultantLogScreen