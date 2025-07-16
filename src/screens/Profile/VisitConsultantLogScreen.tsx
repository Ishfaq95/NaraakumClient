import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
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
import { globalTextStyles } from '../../styles/globalStyles';

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

  useEffect(() => {
    getBeneficiaries();
    getVisitConsultantLog();
  }, []);

  const getVisitConsultantLog = async () => {
    setIsLoading(true);
    const payload = {
      "UserloginInfoId": user?.Id,
    }
    const response = await profileService.getVisitConsultantLog(payload);
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setVisitConsultantLog(response?.Data);
    }
    setIsLoading(false);
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

  useEffect(() => {
    if (selectedPatient && visitConsultantLog.length > 0) {
      filterVisitConsultantLog();
    }
  }, [selectedPatient,visitConsultantLog]);

  const filterVisitConsultantLog = () => {
    const filtered = visitConsultantLog.filter((item: any) => item.PatientUserProfileInfoId == selectedPatient);
    setFilteredVisitConsultantLog(filtered);
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

  const getUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ flex: 1, backgroundColor: '#e4f1ef', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Dropdown data={patientList} value={selectedPatient} onChange={(value: string | number) => setSelectedPatient(value.toString())} placeholder={t('select_patient')} />

        <View style={{ paddingHorizontal: 16, marginTop: 10, alignSelf:"flex-start" }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{`النتائج : (${filteredVisitConsultantLog.length})`}</Text>
      </View>
        <View style={styles.contentContainer}>
          
          <FlatList
            data={filteredVisitConsultantLog}
            renderItem={({ item }: any) => <VisitConsultantLogItemRender item={item} />}
            keyExtractor={(item) => getUniqueId()}
            style={{ width: '100%', }}
            ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
              <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000' }]}>{t('no_addresses')}</Text>
            </View>}
          />
        </View>
      </View>
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
})

export default VisitConsultantLogScreen