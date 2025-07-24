import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image, Modal, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import FullScreenLoader from '../../components/FullScreenLoader';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { AddBeneficiaryComponent } from '../../components/emailUpdateComponent';
import { bookingService } from '../../services/api/BookingService';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';

const BeneficiariesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.root.user.user);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [openBottomSheetMenu, setOpenBottomSheetMenu] = useState(false)
  const [titleType, setTitleType] = useState<any>({})
  const [selectedItemToDelete, setSelectedItemToDelete] = useState<any>(null);
  const [openBottomSheetHeight, setOpenBottomSheetHeight] = useState('65%')
  const [focusedField, setFocusedField] = useState('');
  const [editData, setEditData] = useState<any>({})
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    relation: '',
    age: '',
    gender: '',
    insurance: '',
    nationality: 'citizen',
    idNumber: '',
  })

  const SelfMenu = [
    { title: 'التقارير الطبية', onPress: () => { } },
    { title: 'التاريخ المرضي', onPress: () => { } },
  ];

  const OtherMenu = (item: any) => [
    { title: 'التقارير الطبية', onPress: () => { } },
    { title: 'التاريخ المرضي', onPress: () => { } },
    { title: 'تعديل البيانات', onPress: () => HandleEditPress(item) },
    { title: 'حذف', onPress: () => HandleOpenDeleteModal(item) },
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (focusedField === 'idNumber') {
          setOpenBottomSheetHeight("95%");
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setOpenBottomSheetHeight("65%");
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [openBottomSheet, focusedField]);


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

  const HandleThreeDotPress = (item: any) => {
    setOpenBottomSheetMenu(true)
    setTitleType(item)
  }

  const renderItem = ({ item }: any) => {
    return (
      <View style={[{ width: '100%', height: 150, backgroundColor: '#f9f1f1', marginBottom: 10, borderRadius: 10, padding: 10 }, item.RelationshipTitlePlang == 'Self' && { borderWidth: 1, borderColor: '#dc3545' }]}>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{item.FullnameSlang}</Text>
          <TouchableOpacity onPress={() => HandleThreeDotPress(item)} style={{ height: 30, width: 30, backgroundColor: '#e4f1ef', borderRadius: 20, padding: 5, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Entypo name="dots-three-vertical" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingTop: 10 }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{`صلة القرابة: ${item.RelationshipTitleSlang}`}</Text>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{`تاريخ الإضافة : ${moment(item.CreatedDate).format('DD/MM/YYYY')}`}</Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 20 }}>
          <TouchableOpacity style={{ height: 40, width: '48%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[globalTextStyles.caption, { color: '#fff', fontWeight: 'bold' }]}>التقارير الطبية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ height: 40, width: '48%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[globalTextStyles.caption, { color: '#fff', fontWeight: 'bold' }]}>التاريخ المرضي</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const HandleAddBeneficiary = () => {
    setOpenBottomSheet(true)
    setEditData({})
    setBeneficiaryForm({
      name: '',
      relation: '',
      age: '',
      gender: '',
      insurance: '',
      nationality: 'resident',
      idNumber: '',
    })
  }

  const updateBeneficiaryField = (field: string, value: string) => {
    setBeneficiaryForm(prev => ({ ...prev, [field]: value }));
  }


  const HandleSubmitFormData = async () => {
    try {
      setIsLoading(true)

      if (editData?.UserProfileinfoId) {
        const Payload = {
          "FullNamePlang": beneficiaryForm.name,
          "FullNameSlang": beneficiaryForm.name,
          "CatRelationshipId": beneficiaryForm.relation,
          "RefferalUserloginInfoId": user.Id,
          "CatInsuranceCompanyId": beneficiaryForm.insurance,
          "Gender": beneficiaryForm.gender === 'male' ? '1' : '0',
          "Age": beneficiaryForm.age,
          "CatNationalityId": beneficiaryForm.nationality === 'citizen' ? 213 : 187,
          "IDNumber": beneficiaryForm.nationality === 'citizen' ? beneficiaryForm.idNumber : '',
          "UserProfileId": editData.UserProfileinfoId,
        }
        const response = await bookingService.updateBeneficiaryData(Payload)
        setOpenBottomSheet(false)
        setTimeout(() => { getBeneficiaries(); }, 500);
      } else {
        const Gender = beneficiaryForm.gender === 'male' ? '1' : '0';
        const Payload = {
          "FullNamePlang": beneficiaryForm.name,
          "FullNameSlang": beneficiaryForm.name,
          "CatRelationshipId": beneficiaryForm.relation,
          "RefferalUserloginInfoId": user.Id,
          "CatInsuranceCompanyId": beneficiaryForm.insurance,
          "Gender": Gender,
          "Age": beneficiaryForm.age,
          "CatNationalityId": beneficiaryForm.nationality === 'citizen' ? 213 : 187,
          "IDNumber": beneficiaryForm.nationality === 'citizen' ? beneficiaryForm.idNumber : '',
        }
        const response = await bookingService.addBeneficiary(Payload)
        setOpenBottomSheet(false)
        setTimeout(() => { getBeneficiaries(); }, 500);
      }
    } catch (error) {
      console.log('error ', error);

    } finally {
      setIsLoading(false)
    }
  }

  const HandleDeleteBeneficiaryData = async () => {
    if (!selectedItemToDelete) return;
    const userId = selectedItemToDelete.UserProfileinfoId;
    try {
      setIsLoading(true)
      const payload = {
        "UserProfileInfoId": userId
      }
      const response = await bookingService.deleteBeneficiaryData(payload)
      setDeleteModal(false)
      setTimeout(() => { getBeneficiaries(); }, 500);
    } catch (error) {
      console.log('error ', error);

    } finally {
      setIsLoading(false)
    }
  }


  const HandleOpenDeleteModal = (item: any) => {
    setOpenBottomSheetMenu(false)
    setSelectedItemToDelete(item);
    setDeleteModal(true)
  }

  const HandleEditPress = (item: any) => {
    console.log('item ', item);
    setOpenBottomSheetMenu(false);
    setEditData(item);
    setBeneficiaryForm({
      name: item.FullnamePlang || '',
      age: item.Age || '',
      relation: item.CatRelationshipId || '',
      gender: item.Gender == 1 ? 'male' : 'female',
      insurance: item.CatInsuranceCompanyId || '',
      nationality: item.CatNationalityId == 213 ? 'citizen' : 'resident',
      idNumber: item.CatNationalityId == 213 && item.IDNumber ? item.IDNumber : '',
    });
    setTimeout(() => {
      setOpenBottomSheet(true);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', marginBottom: 10 }]}>المستفيدون (المرضى)</Text>
        <Text style={[globalTextStyles.bodySmall, { fontWeight: '500', color: '#000', marginBottom: 10, textAlign: 'center' }]}>يمكنك إضافة أكثر من مستفيد، مع إضافة التاريخ المرضي والتقارير الطبية لكل مستفيد</Text>
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
      <TouchableOpacity onPress={HandleAddBeneficiary} style={{ height: 50, marginTop: 10, backgroundColor: '#23a2a4', marginHorizontal: 10, marginBottom: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[globalTextStyles.buttonMedium, { color: '#fff' }]}>{t('add_beneficiary')}</Text>
      </TouchableOpacity>
      <FullScreenLoader visible={isLoading} />
      <CustomBottomSheet
        visible={openBottomSheet}
        onClose={() => setOpenBottomSheet(false)}
        height={openBottomSheetHeight}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <AddBeneficiaryComponent
                  onClosePress={() => setOpenBottomSheet(false)}
                  onChangeTextName={(text) => updateBeneficiaryField('name', text)}
                  nameValue={beneficiaryForm.name}
                  onChangeTextRelation={(text) => updateBeneficiaryField('relation', text)}
                  relationValue={beneficiaryForm.relation}
                  onChangeTextAge={(text) => updateBeneficiaryField('age', text)}
                  ageValue={beneficiaryForm.age}
                  onChangeTextGender={(text) => updateBeneficiaryField('gender', text)}
                  genderValue={beneficiaryForm.gender}
                  onChangeTextInsurance={(text) => updateBeneficiaryField('insurance', text)}
                  insuranceValue={beneficiaryForm.insurance}
                  PressNationality={(value) => updateBeneficiaryField('nationality', value)}
                  nationality={beneficiaryForm.nationality}
                  SubmitButton={HandleSubmitFormData}
                  idNumberValue={beneficiaryForm.idNumber}
                  onChangeTextIdNumber={(text) => updateBeneficiaryField('idNumber', text)}
                  setFocusedField={setFocusedField}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </CustomBottomSheet>

      <Modal
        visible={openBottomSheetMenu}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setOpenBottomSheetMenu(false)}
      >
        <View style={styles.modalBackground}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.sheetHeaderContainer}>
              <TouchableOpacity onPress={() => setOpenBottomSheetMenu(false)}>
                <AntDesign name="close" size={30} color="#979e9eff" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuContainer}>
              {(titleType?.RelationshipTitlePlang === 'Self' ? SelfMenu : OtherMenu(titleType)).map((item, index, arr) => (
                <View
                  key={index}
                  style={{
                    width: '100%',
                    borderBottomWidth: index === arr.length - 1 ? 0 : 1,
                    borderBottomColor: '#d9d9d9',
                  }}
                >
                  <TouchableOpacity onPress={item.onPress}>
                    <Text style={styles.menuText}>{item.title}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </SafeAreaView>

        </View>
      </Modal>

      <Modal
        visible={deleteModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setDeleteModal(false)}
      >
        <View style={[styles.modalBackground, { justifyContent: 'center' }]}>
          <View style={styles.modalDeleteContainer}>
            <View style={styles.deleteContainer}>
              <Text style={styles.deleteTitle}>تأكيد</Text>
              <Text style={[styles.deleteTitle, { fontSize: 16 }]}>هل أنت متأكد؟</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={HandleDeleteBeneficiaryData} style={styles.buttonYes}>
                  <Text style={styles.buttonText}>نعم</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeleteModal(false)} style={styles.buttonNo}>
                  <Text style={styles.buttonText}>لا</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    paddingBottom: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden'
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    textAlign: 'left',
    marginVertical: 4,
    fontFamily: CAIRO_FONT_FAMILY.regular
  },
  sheetHeaderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E4F1EF',
    padding: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    width: '80%'
  },
  buttonYes: {
    borderRadius: 14,
    backgroundColor: '#1f6767ff'
  },
  buttonNo: {
    borderRadius: 14,
    backgroundColor: '#979e9eff'
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    padding: 20,

  },
  deleteContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-start'
  },
  deleteTitle: {
    marginVertical: 10,
    fontSize: 20,
  },
  modalDeleteContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10
  },
})

export default BeneficiariesScreen