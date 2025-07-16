import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import FullScreenLoader from '../../components/FullScreenLoader';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import { MediaBaseURL } from '../../shared/utils/constants';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';
import { globalTextStyles } from '../../styles/globalStyles';

const BeneficiariesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.root.user.user);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getBeneficiaries();
  }, []);

  const getBeneficiaries = async () => {
    setIsLoading(true);
    const payload = {
      "UserId": user?.Id,
    }
    const response = await profileService.getBeneficiaries(payload);
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setBeneficiaries(response?.RefferalUserList);
    }
    setIsLoading(false);
  }
  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('beneficiaries')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  const renderItem = ({ item }: any) => {
    return (
      <View style={[{ width: '100%',height: 150, backgroundColor: '#f9f1f1', marginBottom: 10, borderRadius: 10 ,padding: 10},item.RelationshipTitlePlang == 'Self' && { borderWidth: 1, borderColor: '#dc3545' } ]}>
        <View style={{ flexDirection: 'row',  width: '100%', justifyContent: 'space-between' }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{item.FullnameSlang}</Text>
          <TouchableOpacity style={{ height:30,width:30, backgroundColor: '#e4f1ef', borderRadius: 20, padding: 5, marginLeft: 10,justifyContent: 'center', alignItems: 'center' }}>
            <Entypo name="dots-three-vertical" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row',  width: '100%',justifyContent: 'space-between',paddingTop: 10 }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{`صلة القرابة: ${item.RelationshipTitleSlang}`}</Text>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{`تاريخ الإضافة : ${moment(item.CreatedDate).format('DD/MM/YYYY')}`}</Text>
        </View>
        <View style={{ flexDirection: 'row',  width: '100%',justifyContent: 'space-between',marginTop: 20 }}>
          <TouchableOpacity style={{ height:40,width:'48%', backgroundColor: '#23a2a4', borderRadius: 10,justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[globalTextStyles.caption, { color: '#fff', fontWeight: 'bold' }]}>التقارير الطبية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ height:40,width:'48%', backgroundColor: '#23a2a4', borderRadius: 10,justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[globalTextStyles.caption, { color: '#fff', fontWeight: 'bold' }]}>التاريخ المرضي</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', marginBottom: 10 }]}>المستفيدون (المرضى)</Text>
        <Text style={[globalTextStyles.bodySmall, { fontWeight: '500', color: '#000', marginBottom: 10 }]}>يمكنك إضافة أكثر من مستفيد، مع إضافة التاريخ المرضي والتقارير الطبية لكل مستفيد</Text>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={beneficiaries}
          renderItem={renderItem}
          keyExtractor={(item) => item.UserProfileinfoId.toString()}
          style={{ width: '100%', }}
          ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000' }]}>{t('no_beneficiaries')}</Text>
          </View>}
        />
      </View>
      <TouchableOpacity style={{ height: 50,marginTop: 10, backgroundColor: '#23a2a4', marginHorizontal: 10, marginBottom: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[globalTextStyles.buttonMedium, { color: '#fff' }]}>{t('add_beneficiary')}</Text>
      </TouchableOpacity>
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...globalTextStyles.h3,
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

export default BeneficiariesScreen