import { View, Text, TouchableOpacity, Platform, Alert, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Feather from 'react-native-vector-icons/Feather'
import * as DocumentPicker from '@react-native-documents/picker';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../shared/redux/store';
import { MediaBaseURL } from '../../shared/utils/constants';
import FullScreenLoader from '../../components/FullScreenLoader';
import { setHomeDialysisFilePaths } from '../../shared/redux/reducers/bookingReducer';
import { globalTextStyles } from '../../styles/globalStyles';
import { profileService } from '../../services/api/ProfileService';

const UploadFileStep = ( {OrderId}: any ) => {
  const user = useSelector((state: any) => state.root.user.user);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePaths, setFilePaths] = useState<any[]>([]);
  const [medicalData, setMedicalData] = useState<any[]>([]);
  const mediaToken = useSelector((state: any) => state.root.user.mediaToken);
  const dispatch = useDispatch();

  useEffect(() => {
    getMedicalReport()
  }, [OrderId]);

  const getMedicalReport = async () => {
    const payload = {
      "PatientId": user.Id,
      "OrderId": OrderId,
    }
    const response = await profileService.getMedicalReport(payload)
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setMedicalData(response.PatientFiles)
    }
  }

  const handleFileSelection = async () => {
    try {
      const pickresult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      let pickerResult = null;
      if (Platform.OS === 'ios') {
        pickerResult = pickresult[0];
      } else {
        pickerResult = pickresult;
      }

      if (!pickerResult) {
        return;
      }

      const file = {
        uri: pickerResult.uri,
        type: pickerResult.type || 'application/octet-stream',
        name: pickerResult.name,
        size: pickerResult.size,
      };

      await uploadFile(file, pickerResult);
    } catch (err) {
      console.error('File selection error:', err);

      if (DocumentPicker.isCancel(err)) {
        return;
      }

      if (err instanceof Error) {
        Alert.alert(
          'Error',
          `Failed to select file: ${err.message}. Please try again.`,
        );
      } else {
        Alert.alert('Error', 'Failed to select file. Please try again.');
      }
    }
  };

  const uploadFile = async (file: any, pickerResult: any) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      let url = `${MediaBaseURL}/common/upload`;
      let ResourceCategoryId = '2';

      let fileType = file.name.split('.').pop();
      if (fileType == 'pdf' || fileType == 'PDF') ResourceCategoryId = '4';
      else if (
        fileType == 'jpg' ||
        fileType == 'jpeg' ||
        fileType == 'gif' ||
        fileType == 'png' ||
        fileType == 'JPG' ||
        fileType == 'JPEG' ||
        fileType == 'GIF' ||
        fileType == 'PNG'
      )
        ResourceCategoryId = '1';

      const formData = new FormData();
      // Create file object that matches backend expectations
      const fileData = {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name,
      };

      // Append file with the exact field name expected by backend
      formData.append('file', fileData);
      formData.append('UserType', user.CatUserTypeId);
      formData.append('Id', user.Id);
      formData.append('ResourceCategory', ResourceCategoryId);
      formData.append('ResourceType', '6');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer${mediaToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Error response:', errorText);

        if (response.status === 504) {
          throw new Error('Server took too long to respond. Please try again.');
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();

      if (responseData.ResponseStatus?.STATUSCODE === '200') {
        // Add the file message to the chat
        const previousFilePaths = [...filePaths,responseData.Data.Path];
        dispatch(setHomeDialysisFilePaths(previousFilePaths));
        setFilePaths(previousFilePaths);
      } else {
        throw new Error(
          responseData.ResponseStatus?.MESSAGE || 'Upload failed',
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof Error
          ? error.message
          : 'Failed to upload file. Please try again.',
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  console.log('filePaths', filePaths)

  return (
    <View style={{ flex: 1 }}>
      <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', textAlign: 'left' }]}>التقارير الطبية</Text>
      {/* <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', textAlign: 'left' }]}>رجاء ارفاق التقارير الطبية الخاصة بالمريض</Text> */}
      <View style={{ height:200,width:'100%', marginTop: 10,backgroundColor:'#fff',borderRadius:10,padding:10,alignItems:'center',justifyContent:'center' }}>
        <View style={{ height:'90%',width:'90%', justifyContent: 'center', alignItems: 'center', borderWidth:1,borderColor:'#000',borderStyle:'dashed',borderRadius:10 }}>
          <TouchableOpacity onPress={handleFileSelection} style={{justifyContent:'center',alignItems:'center'}}>
          <Feather name='upload' size={40} color='#239ea0' style={{ marginBottom: 10 }} />
          </TouchableOpacity>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000' }]}>اضغط هنا لارفاق التقارير الطبية</Text>
          <Text style={[globalTextStyles.caption, { color: '#000' }]}>يمكنك اضافة ملف او اكثر</Text>
        </View>
      </View>
      <View style={{ flex:1, marginTop: 10 }}>
        <FlatList
          data={filePaths}
          renderItem={({ item, index }) => (
            <View style={{ flexDirection: 'row',width:'100%',marginBottom:8,paddingHorizontal:16, height:30,borderWidth:1,borderColor:'#fff', alignItems: 'center', justifyContent: 'space-between' }} key={index}>
            <Text style={[globalTextStyles.caption, { color: '#000' }]}>HemoDiyalsis Report</Text>
           
            <TouchableOpacity  onPress={() => {
              const previousFilePaths = filePaths.filter((_, i) => i !== index)
              setFilePaths(previousFilePaths)
              dispatch(setHomeDialysisFilePaths(previousFilePaths))
            }}>
              <Feather name='trash' size={20} color='#239ea0' />
            </TouchableOpacity>
          </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <FullScreenLoader visible={isUploading} />
    </View>
  )
}

export default UploadFileStep