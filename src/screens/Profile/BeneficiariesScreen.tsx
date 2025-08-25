import { View, Text, TouchableOpacity, StyleSheet, FlatList,SafeAreaView, Image, Modal, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Share, PermissionsAndroid, ScrollView } from 'react-native'
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
import RNFetchBlob from 'rn-fetch-blob';
import { MediaBaseURL } from '../../shared/utils/constants';
// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

const BeneficiariesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.root.user.user);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [openBottomSheetMenu, setOpenBottomSheetMenu] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>({})
  const [selectedItemToDelete, setSelectedItemToDelete] = useState<any>(null);

  const [focusedField, setFocusedField] = useState('');
  const [openBottomSheetReport, setOpenBottomSheetReport] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [reportType, setReportType] = useState<any>('')
  const [medicalData, setMedicalData] = useState<any>({})
  const [isDownloading, setIsDownloading] = useState(false);
   const [sheetHeight, setSheetHeight] = useState("65%");
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    relation: '',
    age: '',
    gender: '',
    insurance: '',
    nationality: 'citizen',
    idNumber: '',
  })


 useEffect(() => {
  const showEvent = Platform.OS === 'ios' ? 'keyboardDidShow' : 'keyboardDidShow';
  const hideEvent = Platform.OS === 'ios' ? 'keyboardDidHide' : 'keyboardDidHide';

  const keyboardShowListener = Keyboard.addListener(showEvent, () => {
    if (focusedField === 'age') {
      setSheetHeight('80%');
    } else if (focusedField === 'idNumber' && beneficiaryForm.nationality === 'citizen') {
      setSheetHeight('100%');
    }
  });

  const keyboardHideListener = Keyboard.addListener(hideEvent, () => setSheetHeight('65%'));

  return () => {
    keyboardShowListener.remove();
    keyboardHideListener.remove();
  };
}, [focusedField, beneficiaryForm.nationality]);



  const SelfMenu = [
    { title: 'التقارير الطبية', onPress: () => { setOpenBottomSheetMenu(false); HandleReportPress(selectedItem, 'report') } },
    { title: 'التاريخ المرضي', onPress: () => { setOpenBottomSheetMenu(false); HandleReportPress(selectedItem, 'history') } },
  ];

  const OtherMenu = (item: any) => [
    { title: 'التقارير الطبية', onPress: () => { setOpenBottomSheetMenu(false); HandleReportPress(item, 'report') } },
    { title: 'التاريخ المرضي', onPress: () => { setOpenBottomSheetMenu(false); HandleReportPress(item, 'history') } },
    { title: 'تعديل البيانات', onPress: () => HandleEditPress(item) },
    { title: 'حذف', onPress: () => HandleOpenDeleteModal(item) },
  ];




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
        <Text style={styles.headerTitle}>{'المستفيدون'}</Text>
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
    setSelectedItem(item)
  }

  const HandleReportPress = (item: any, type: string) => {
    setOpenBottomSheetReport(true)
    setReportType(type)
    if (type == 'report') {
      getMedicalReport(item)
    } else {
      getMedicalHistory(item)
    }
  }

  const getMedicalReport = async (item: any) => {
    setMedicalData([])
    const payload = {
      "PatientId": item.UserProfileinfoId,
    }
    const response = await profileService.getMedicalReport(payload)
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setMedicalData(response.PatientFiles)
    }
  }

  const getMedicalHistory = async (item: any) => {
    setMedicalData([])
    const payload = {
      "PatientId": item.UserProfileinfoId,
    }
    const response = await profileService.getMedicalHistory(payload)
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setMedicalData(response.Patient)
    }
  }

  const HandleDownloadPress = (item: any) => {
    if (reportType == 'report') {
      downloadFileFromReport(item.FilePath)
    } else {
      // Generate medical history PDF
      generateMedicalHistoryPDF(item)
    }
  }

  const downloadFileFromReport = (url: string) => {
    if (isDownloading) return;

    setIsDownloading(true);

    // Ensure URL doesn't start with a slash to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const fileURL = `${MediaBaseURL}/${cleanUrl}`;
    let fileName: any = getFileNameFromUrl(fileURL);

    if (Platform.OS === 'ios') {
      downloadFIleForIOS(fileURL, fileName);
    } else {
      downloadFile(fileURL, fileName);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    // Split the URL by '/'
    const parts = url.split('/');
    // Get the last part, which is the filename
    let fileName = parts.pop();

    // If no filename found, generate a default one
    if (!fileName || fileName === '') {
      fileName = `document_${Date.now()}.pdf`;
    }

    // Remove any query parameters
    fileName = fileName.split('?')[0];

    return fileName;
  };

  const downloadFIleForIOS = (url: string, fileName: string) => {
    const { config, fs } = RNFetchBlob;

    // For iOS, we'll use the Documents directory and then share the file
    const DocumentDir = fs.dirs.DocumentDir;
    const filePath = `${DocumentDir}/${fileName}`;

    config({
      fileCache: true,
      path: filePath,
    })
      .fetch('GET', url)
      .then(res => {
        shareFile(res.path(), fileName);
      })
      .catch(error => {
        console.error('Download error:', error);
        Alert.alert('File downloading error.', error.message || 'Unknown error');
      })
      .then(() => {
        setIsDownloading(false);
      });
  };

  const shareFile = async (filePath: string, fileName: string) => {
    try {
      // For iOS, we need to use the file:// protocol
      const fileUrl = `file://${filePath}`;

      await Share.share({
        url: fileUrl,
        title: fileName,
        message: `Sharing ${fileName}`
      });
    } catch (error) {
      console.error('Share error:', error);
      // Fallback: try to copy file to a more accessible location
      try {
        const { fs } = RNFetchBlob;
        const DocumentDir = fs.dirs.DocumentDir;
        const newPath = `${DocumentDir}/Shared/${fileName}`;

        // Create directory if it doesn't exist
        await fs.mkdir(`${DocumentDir}/Shared`);

        // Copy file to shared location
        await fs.cp(filePath, newPath);

        Alert.alert(
          'File Copied',
          'File has been copied to a shared location. You can find it in the Files app under "On My iPhone/iPad" > "Documents" > "Shared".',
          [
            {
              text: 'Open Files App',
              onPress: () => {
                // This will open the Files app
                const filesUrl = 'shortcuts://run-shortcut?name=Files';
                // Note: This is a fallback, the actual implementation might vary
                Alert.alert('Files App', 'Please open the Files app manually and navigate to "On My iPhone/iPad" > "Documents" > "Shared" to find your file.');
              }
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } catch (copyError) {
        console.error('Copy error:', copyError);
        Alert.alert('Error', 'Could not copy file to shared location. Please try downloading again.');
      }
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    const { config, fs } = RNFetchBlob;
    const DownloadDir = fs.dirs.DownloadDir;
    const filePath = `${DownloadDir}/${fileName}`;

    config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: fileName,
        path: filePath,
      },
    })
      .fetch('GET', url)
      .then(res => {
        Alert.alert('تم تنزيل الملف بنجاح');
      })
      .catch(error => {
        Alert.alert('File downloading error.');
      })
      .then(() => {
        setIsDownloading(false);
      });
  };

  const generateMedicalHistoryPDF = async (medicalData: any) => {
    try {
      setIsDownloading(true);

      // Create HTML content for the medical history PDF using the provided data
      const htmlContent = createMedicalHistoryHTML(medicalData);

      // Generate PDF
      const fileName = `MedicalHistory_${medicalData.OrderId || 'Patient'}_${moment().locale('en').format('YYYYMMDD_HHmmss')}.pdf`;

      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);

      if (file.filePath) {

        const filePath = file.filePath
        const fileName = `MedicalHistory_${medicalData.OrderId}_${moment().locale('en').format('YYYYMMDD_HHmmss')}`;

        const downloadPath = await downloadFileForHistory(filePath, fileName);

      } else {
        Alert.alert('Error', 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate medical history PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      // For Android 11+ (API 30+), WRITE_EXTERNAL_STORAGE is deprecated
      // and not needed for accessing Downloads folder
      const androidVersion = Number(Platform.Version);
      
      if (androidVersion >= 30) {
        // Android 11+ - no permission needed for Downloads folder
        return true;
      } else {
        // Android 10 and below - request WRITE_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save PDF files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Download file for Android
  const downloadFileForHistory = async (filePath: string, fileName: string): Promise<string> => {
    const { fs } = RNFetchBlob;

    try {
      let destinationPath = '';

      if (Platform.OS === 'android') {
        // Check if we need permission (Android 10 and below)
        const androidVersion = Number(Platform.Version);
        const needsPermission = androidVersion < 30;
        
        if (needsPermission) {
          const hasPermission = await requestStoragePermission();
          if (!hasPermission) {
            // Use internal storage if permission denied
            destinationPath = `${fs.dirs.DownloadDir}/${fileName}.pdf`;
            await RNFS.copyFile(filePath, destinationPath);
            Alert.alert(
              'تم تنزيل الملف بنجاح',
              'تم تنزيل الملف بنجاح'
            );
            return destinationPath;
          }
        }

        // Try to save to external Downloads folder
        try {
          destinationPath = `/storage/emulated/0/Download/${fileName}.pdf`;
          await RNFS.copyFile(filePath, destinationPath);
          Alert.alert(
            'تم تنزيل الملف بنجاح',
            'تم تنزيل الملف بنجاح'
          );
        } catch (externalError) {
          // Fallback to internal Downloads
          destinationPath = `${fs.dirs.DownloadDir}/${fileName}.pdf`;
          await RNFS.copyFile(filePath, destinationPath);
          Alert.alert(
            'تم تنزيل الملف بنجاح',
            'تم تنزيل الملف بنجاح'
          );
        }
      } else {
        // iOS - use Documents directory
        destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;
        await RNFS.copyFile(filePath, destinationPath);
        shareFile(filePath, destinationPath);
      }

      return destinationPath;
    } catch (error) {
      console.error('Error copying file:', error);
      Alert.alert('File downloading error.', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  const createMedicalHistoryHTML = (medicalData: any) => {
    const orderId = medicalData.OrderId || '';
    const orderDate = medicalData.OrderDate ? moment(medicalData.OrderDate).locale('en').format('DD/MM/YYYY') : '';

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>التاريخ المرضي</title>
        <style>
          @font-face {
            font-family: 'Cairo';
            src: url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
          }
          body {
            font-family: 'Cairo', Arial, sans-serif;
            font-size: 13px;
            color: #1D1D1D;
            margin: 0;
            padding: 20px;
            direction: ltr;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 20px;
          }
          .logo {
            text-align: left;
          }
          .contact-info {
            text-align: center;
          }
          .title-section {
            text-align: right;
            width: 180px;
          }
          .title-section h2 {
            font-size: 24px;
            margin: 0 0 5px 0;
          }
          .divider {
            background: #ccc;
            height: 3px;
            margin: 20px 0;
          }
          .patient-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          .patient-name {
            font-size: 20px;
            font-weight: bold;
          }
          .medical-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #ccc;
          }
          .medical-table th {
            background: #32A3A4;
            color: #FFF;
            padding: 10px;
            text-align: right;
            border: 1px solid #FFF;
          }
          .medical-table td {
            padding: 10px;
            border: 1px solid #FFF;
            text-align: right;
          }
          .medical-table tr:nth-child(even) td {
            background: #F4FDFE;
          }
          .label {
            font-weight: bold;
            white-space: nowrap;
          }
          .value {
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Logo" style="width: 100px; height: 50px;" />
          </div>
          <div class="contact-info">
            <p style="margin: 0; text-decoration: underline;">info@naraakum.com</p>
          </div>
          <div class="title-section">
            <h2>التاريخ المرضي</h2>
            <p style="margin: 0; text-decoration: underline;">www.naraakum.com</p>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="patient-info">
          <div>
            <span class="label">رقم الطلب :</span> <span>${orderId}</span>
          </div>
          <div class="patient-name">مريض</div>
        </div>
        
        <div class="patient-info">
          <div>
            <span class="label">تاريخ الطلب :</span> <span>${orderDate}</span>
          </div>
        </div>
        
        <table class="medical-table">
          <tr>
            <th colspan="2">التاريخ المرضي</th>
          </tr>
          <tr>
            <td class="value">${medicalData.MedicalComplaint || ''}</td>
            <td class="label">ماهي شكواك الطبيه</td>
          </tr>
          <tr>
            <td class="value">${medicalData.MedicalComplaintSufferingLast || ''}</td>
            <td class="label">كم مدة المعاناه</td>
          </tr>
          <tr>
            <td class="value">${medicalData.isRepetitive ? 'نعم' : 'لا'}</td>
            <td class="label">هل هي متكرره</td>
          </tr>
          <tr>
            <td class="value">${medicalData.Allergies || ''}</td>
            <td class="label">هل لديك حساسيه ؟</td>
          </tr>
          <tr>
            <td class="value">${medicalData.isSmoke == 1 ? 'نعم' : 'لا'}</td>
            <td class="label">هل تدخن ؟</td>
          </tr>
          <tr>
            <td class="value">${medicalData.FamilyMedicalHistory || ''}</td>
            <td class="label">هل هناك مشاكل طبيه في الأسره ؟</td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  const renderMedicalItem = ({ item }: any) => {
    if (item.OrderId == null) {
      return null
    }
    return (
      <View style={{ padding: 10, borderWidth: 1, backgroundColor: '#fff', borderColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', textAlign: 'left' }]}>{item.CPFullnameSlang || item.FileName || ''}</Text>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <Text style={[globalTextStyles.bodyMedium]}> رقم الطلب</Text>
          <Text style={[globalTextStyles.bodyMedium]}>{item.OrderId}</Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <Text style={[globalTextStyles.bodyMedium]}> تاريخ الطلب</Text>
          <Text style={[globalTextStyles.bodyMedium]}>{moment(item.OrderDate).locale('en').format('DD/MM/YYYY')}</Text>
        </View>

        <TouchableOpacity onPress={() => HandleDownloadPress(item)} style={{ height: 40, width: '100%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
          <Text style={[globalTextStyles.bodyMedium, { color: '#fff' }]}>{reportType == 'report' ? 'تحميل الملف' : 'استعراض السجل'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderItem = ({ item }: any) => {
    return (
      <View style={[{ width: '100%', height: 150, backgroundColor: '#f9f1f1', marginBottom: 10, borderRadius: 10, padding: 10 }, item.UserloginInfoId == user.Id && { borderWidth: 1, borderColor: '#dc3545' }]}>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>{item.FullnameSlang}</Text>
          <TouchableOpacity onPress={() => HandleThreeDotPress(item)} style={{ height: 30, width: 30, backgroundColor: '#e4f1ef', borderRadius: 20, padding: 5, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Entypo name="dots-three-vertical" size={18} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingTop: 10 }}>
          <Text style={[globalTextStyles.bodyMedium, { color: '#000' }]}>{`صلة القرابة: ${item.RelationshipTitleSlang}`}</Text>
          <Text style={[globalTextStyles.bodyMedium, { color: '#000' }]}>{`تاريخ الإضافة : ${moment(item.CreatedDate).locale('en').format('DD/MM/YYYY')}`}</Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 20 }}>
          <TouchableOpacity onPress={() => HandleReportPress(item, 'report')} style={{ height: 40, width: '48%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[globalTextStyles.buttonSmall, { color: '#fff',  }]}>التقارير الطبية</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => HandleReportPress(item, 'history')} style={{ height: 40, width: '48%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[globalTextStyles.buttonSmall, { color: '#fff', }]}>التاريخ المرضي</Text>
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
    if (isLoading) return;
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
        }
        const response = await bookingService.addBeneficiary(Payload)
        setOpenBottomSheet(false)
        setTimeout(() => { getBeneficiaries(); }, 500);
      }
    } catch (error) {

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
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: '600', color: '#000', marginBottom: 10 }]}>المستفيدون (المرضى)</Text>
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
      <FullScreenLoader visible={isLoading || isDownloading} />

      <CustomBottomSheet
        visible={openBottomSheetReport}
        onClose={() => setOpenBottomSheetReport(false)}
        height={'80%'}
        backdropClickable={false}
        showHandle={false}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <View style={{ height: 50, width: '100%', backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
            <Text style={[globalTextStyles.bodyLarge, { fontWeight: '600', color: '#000' }]}>{reportType == 'report' ? 'التقارير الطبية' : 'التاريخ المرضي'}</Text>
            <TouchableOpacity onPress={() => setOpenBottomSheetReport(false)}>
              <AntDesign name="close" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <FlatList
              data={medicalData}
              renderItem={renderMedicalItem}
              keyExtractor={(item) => item.Id?.toString()}
              style={{ flex: 1, paddingTop: 10 }}
              ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000' }]}>ليس هنالك معلومات</Text>
              </View>}
            />
          </View>
        </View>
      </CustomBottomSheet>

      <CustomBottomSheet
        visible={openBottomSheet}
        onClose={() => setOpenBottomSheet(false)}
        showHandle={false}
        height={sheetHeight}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
          <Text style={styles.bottomSheetHeaderText}>بيانات المستفيد</Text>
            <TouchableOpacity onPress={() => setOpenBottomSheet(false)}>
              <AntDesign name="close" size={24} color="#979e9eff" />
            </TouchableOpacity>
            
          </View>
          <ScrollView
            style={{ flex: 1 }}
            // contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            >
            <KeyboardAvoidingView
            style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  <AddBeneficiaryComponent
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
                    isLoading={isLoading}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
          </ScrollView>
        </View>
      </CustomBottomSheet>

      <Modal
        visible={openBottomSheetMenu}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}

        onRequestClose={() => setOpenBottomSheetMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpenBottomSheetMenu(false)}>
          <View style={styles.modalBackground}>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.sheetHeaderContainer}>
                <TouchableOpacity onPress={() => setOpenBottomSheetMenu(false)}>
                  <AntDesign name="close" size={24} color="#979e9eff" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuContainer}>
                {((selectedItem?.UserloginInfoId && selectedItem?.UserloginInfoId == user.Id) ? SelfMenu : OtherMenu(selectedItem)).map((item, index, arr) => (
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
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={deleteModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setDeleteModal(false)}
      >
        <View style={[styles.modalBackground]}>
          <View style={styles.modalDeleteContainer}>
            <View style={{ height: 50, backgroundColor: '#E4F1EF', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text style={styles.deleteTitle}>تأكيد</Text>
            </View>

            <Text style={[{ paddingHorizontal: 16, paddingVertical: 10, color: '#000', fontFamily: CAIRO_FONT_FAMILY.regular }]}>هل أنت متأكد؟</Text>
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
    paddingBottom: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#000',
  },
  sheetHeaderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E4F1EF',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 16,
    width: '100%'
  },
  buttonYes: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: '#1f6767ff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  buttonNo: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: '#979e9eff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    // padding: 20,
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  deleteContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-start'
  },
  deleteTitle: {
    ...globalTextStyles.bodyMedium,
    textAlign: 'left',
    color: '#000',
  },
  modalDeleteContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  bottomSheetHeaderText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#36454F',

  },
})

export default BeneficiariesScreen