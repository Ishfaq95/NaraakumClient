import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../components/common/Dropdown';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';

interface PatientItem {
  label: string;
  value: string;
}

interface PatientDetail {
  FullnameSlang: string;
  AccumulativeRatingAvg: number;
  AccumulativeRatingNum: number;
}

interface CommentItem {
  Id: string;
  FullnameSlang: string;
  RateValue: number;
  OrganizationTitleSlang: string;
  Comment: string;
  DateAdded: string;
}

const MyRatingScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const user = useSelector((state: RootState) => state.root.user.user);
    const [patientList, setPatientList] = useState<PatientItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [patientDetails, setPatientDetails] = useState<PatientDetail[]>([]);
    const [commentList, setCommentList] = useState<CommentItem[]>([]);

    useEffect(() => {
      getBeneficiaries();
    }, []);
  
    const getBeneficiaries = async () => {
      setIsLoading(true);
      const payload = {
        "UserId": user?.Id,
      }
      const response = await profileService.getBeneficiaries(payload);

      console.log("Response", response);
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
      if (selectedPatient) {
        getPatientRating();
      }
    }, [selectedPatient]);

    const getPatientRating = async () => {
      const payload = {
        "PatientProfileId": selectedPatient,
      }
      const response = await profileService.getPatientRating(payload);

      if (response?.ResponseStatus?.STATUSCODE == 200) {
        setPatientDetails(response?.UserRating || []);
        setCommentList(response?.CommentList || []);
      }
    }

    const handleBack = () => {
        navigation.goBack();
      };

      console.log("Patient Details", patientDetails);
      console.log("Comment List", commentList);

    const renderHeader = () => (
        <Header
          centerComponent={
            <Text style={styles.headerTitle}>{t('patient_rating')}</Text>
          }
          leftComponent={
            <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
              <ArrowRightIcon />
            </TouchableOpacity>
          }
          containerStyle={styles.headerContainer}
        />
      );

      const renderItem = ({ item }: { item: CommentItem }) => {
        return (
          <View style={{
            borderRadius: 12,
            marginVertical: 8,
            padding: 16,
            backgroundColor: '#f0f0f0',
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}>
          <View style={{flexDirection:"row",width:"100%", alignItems:"center",justifyContent:"space-between"}}>
            <Text style={{fontSize:16,fontWeight:"bold",color:"#000"}}>{item.FullnameSlang}</Text>
            <View style={{flexDirection:"row",height:30,width:80,backgroundColor:"#fff", alignItems:"center",justifyContent:"center",borderRadius:15}}>
              <Text style={{fontSize:16,fontWeight:"bold",color:"#000",marginRight:5}}>{`${item.RateValue}/5`}</Text>
              <AntDesign name="star" size={20} color="#23a2a4" />
            </View>
          </View>
          <Text style={{fontSize:16,fontWeight:"400",color:"#36454f",textAlign:"left"}}>{item.OrganizationTitleSlang}</Text>
          <Text style={{fontSize:16,fontWeight:"400",color:"#36454f",textAlign:"left",paddingVertical:10}}>{item.Comment}</Text>
          <Text style={{fontSize:16,fontWeight:"400",color:"#36454f",textAlign:"left"}}>{moment(item.DateAdded).format('DD/MM/YYYY')}</Text>
        </View>
        )
    }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10,marginTop: 10, alignItems: 'center', }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10 }}>تقييمات سلوك المريض في أثناء الزيارة</Text>
      </View>
      <View style={{flex: 1, backgroundColor: '#e4f1ef', paddingHorizontal: 16, paddingVertical: 10,marginTop: 10, alignItems: 'center', }}>
        <Dropdown data={patientList} value={selectedPatient} onChange={(value: string | number) => setSelectedPatient(value.toString())} placeholder={t('select_patient')} />
        <View style={{height:150,width:"100%",marginTop:10,backgroundColor:"#fff",borderRadius:10,alignItems:"center",justifyContent:"center"}}>
          <Text style={{fontSize:24,fontWeight:"bold",color:"#000",paddingVertical:10}}>{patientDetails[0]?.FullnameSlang || ''}</Text>
          <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
            
            <Text style={{fontSize:16,fontWeight:"bold",color:"#23a2a4",marginRight:5}}>{patientDetails[0]?.AccumulativeRatingAvg || 0}</Text>
            <AntDesign name="star" size={24} color="#23a2a4" />
          </View>
          <Text style={{fontSize:16,fontWeight:"bold",color:"#000",paddingVertical:10}}>{`عدد التقييمات ${patientDetails[0]?.AccumulativeRatingNum || 0}`}</Text>
        </View>

        <View style={styles.contentContainer}>
        <FlatList
          data={commentList}
          renderItem={renderItem}
          keyExtractor={(item) => item?.Id?.toString()}
          style={{ width: '100%', }}
          ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>{t('no_addresses')}</Text>
          </View>}
        />
      </View>
      </View>
    </SafeAreaView>
  )
}

const styles=StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#e4f1ef' 
    },
 contentContainer: { 
    flex: 1, 
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    borderRadius: 10,
    paddingTop: 10,
},
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
})

export default MyRatingScreen