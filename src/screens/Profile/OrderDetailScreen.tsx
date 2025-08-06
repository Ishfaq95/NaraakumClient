import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, PermissionsAndroid, Platform } from 'react-native';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import ClockIcon from '../../assets/icons/ClockIcon';
import SettingIconSelected from '../../assets/icons/SettingIconSelected';
import { useTranslation } from 'react-i18next';
import CommonRadioButton from '../../components/common/CommonRadioButton';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import { countries } from '../../utils/countryData';
import { addCardItem, setApiResponse } from '../../shared/redux/reducers/bookingReducer';
import { bookingService } from '../../services/api/BookingService';
import { generatePayloadforOrderMainBeforePayment, generatePayloadforUpdateOrderMainBeforePayment, generateUniqueId } from '../../shared/services/service';
import { useDispatch, useSelector } from 'react-redux';
import { MediaBaseURL } from '../../shared/utils/constants';
import moment from 'moment';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import axiosInstance from '../../Network/axiosInstance';
import { store } from '../../shared/redux/store';
import RNFS from 'react-native-fs';
// import { TrackPlayerService } from '../../services/TrackPlayerService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { profileService } from '../../services/api/ProfileService';
import Header from '../../components/common/Header';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderDetailScreen = ({ navigation, route }: any) => {
  const OrderId = route?.params?.OrderId;
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selected, setSelected] = useState('myself');
  const [fullNumber, setFullNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any | undefined>(countries.find(c => c.code === 'sa'));
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [actualRecordingDuration, setActualRecordingDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const audioRecorderPlayer = useRef<AudioRecorderPlayer>(new AudioRecorderPlayer());
  const progressIntervalRef = useRef<any>(null);

  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const apiResponse = useSelector((state: any) => state.root.booking.apiResponse);
  const [showGroupedArray, setShowGroupedArray] = useState([]);
  const [completeOrderDetail, setCompleteOrderDetail] = useState<any>([]);
  const selectedDoctor: any = showGroupedArray[selectedIndex];
  const dispatch = useDispatch();
  const [visitRecordList, setVisitRecordList] = useState<any>([]);
  useEffect(() => {
    // Request microphone permission
    requestMicrophonePermission();

    // Set up audio recorder with proper settings
    audioRecorderPlayer.current.setSubscriptionDuration(0.1);

    // Add record back listener for debugging
    audioRecorderPlayer.current.addRecordBackListener((e) => {
    });

    // Set up audio session for better recording quality
    const setupAudioSession = async () => {
      try {
        // Enable recording in silence mode for better audio quality
        if (Platform.OS === 'ios') {
          // iOS specific audio session setup
        }
      } catch (error) {
      }
    };

    setupAudioSession();

    return () => {
      // Cleanup timer on unmount
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      // Cleanup audio recorder
      if (audioRecorderPlayer.current) {
        audioRecorderPlayer.current.removeRecordBackListener();
      }
      // Cleanup progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Cleanup track player (silently handle any errors)
      // TrackPlayerService.stop().catch(() => {
      //   // Silently ignore cleanup errors
      // });
    };
  }, []);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleStartRecording = async () => {
    try {
      // Configure recording with better settings for proper metadata
      const audioSet = {
        AudioEncoderAndroid: 'aac',
        AudioSourceAndroid: 'mic',
        AVEncoderAudioQualityKeyIOS: 'high',
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: 'aac',
        OutputFormatAndroid: 'aac',
        AudioSamplingRateAndroid: 44100,
        AudioEncodingBitRateAndroid: 128000,
      } as any;

      const result = await audioRecorderPlayer.current.startRecorder(undefined, audioSet);
      setIsRecording(true);
      setRecordingTime(0);
      setActualRecordingDuration(0);
      setAudioFile(null);
      setUploadedFileUrl(null);

      // Start timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioFile = await audioRecorderPlayer.current.stopRecorder();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (!audioFile) {
        Alert.alert('Error', 'No audio file was created');
        return;
      }

      // Store the actual recording duration before resetting the timer
      const finalDuration = recordingTime;
      setActualRecordingDuration(finalDuration);

      setAudioFile(audioFile);

      // Reset timer display
      setRecordingTime(0);

      // Wait a moment for the file to be fully written
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      // Automatically upload the file
      await uploadAudioFile(audioFile);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const uploadAudioFile = async (audioFile: any) => {

    if (!audioFile) {
      Alert.alert('Error', 'No audio file to upload');
      return;
    }

    // Remove file:// prefix if present for file existence check
    const cleanPath = audioFile.replace('file://', '');

    // Check if file exists
    const fileExists = await RNFetchBlob.fs.exists(cleanPath);
    if (!fileExists) {
      Alert.alert('Error', 'Audio file not found');
      return;
    }

    // Check file size
    const fileInfo = await RNFetchBlob.fs.stat(cleanPath);
    if (fileInfo.size < 1000) { // Less than 1KB
      Alert.alert('Error', 'Audio file is too small, recording may have failed');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create form data for file upload
      const formData = new FormData();

      // Get file info and create proper filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Determine file extension based on the actual file
      const fileExtension = audioFile.split('.').pop() || 'm4a';
      // Use the actual file extension for better compatibility
      const fileName = `audio_${timestamp}.${fileExtension}`;

      // Copy file to a temporary location to ensure proper file handling
      const tempFilePath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
      try {
        await RNFetchBlob.fs.cp(cleanPath, tempFilePath);
      } catch (copyError) {
      }

      // Determine MIME type based on file extension
      const getMimeType = (ext: string) => {
        switch (ext.toLowerCase()) {
          case 'mp3':
            return 'audio/mpeg';
          case 'm4a':
            return 'audio/mp4';
          case 'wav':
            return 'audio/wav';
          case 'aac':
            return 'audio/aac';
          default:
            return 'audio/mpeg';
        }
      };

      // Create file object that matches backend expectations (like ChatScreen)
      const fileData = {
        uri: Platform.OS === 'ios' ? `file://${tempFilePath}` : tempFilePath,
        type: getMimeType(fileExtension), // Use correct MIME type based on file extension
        name: fileName,
      };

      // If copying failed, use the original file
      const finalFileData = await RNFetchBlob.fs.exists(tempFilePath) ? fileData : {
        uri: Platform.OS === 'ios' ? `file://${audioFile}` : audioFile,
        type: getMimeType(fileExtension), // Use correct MIME type based on file extension
        name: fileName,
      };

      // Append file with the exact field name expected by backend
      formData.append('file', finalFileData);


      // Add the required fields - using same pattern as ChatScreen
      formData.append('UserType', user?.CatUserTypeId || '1');
      formData.append('Id', user?.Id || '0');
      formData.append('ResourceCategory', '3'); // Try different category like ChatScreen
      formData.append('ResourceType', '4'); // Use same as ChatScreen for file uploads

      // Validate the audio file by checking its header
      try {
        const fileHeader = await RNFetchBlob.fs.readFile(cleanPath, 'base64');
        const headerPreview = fileHeader.substring(0, 100);

        // Check for common audio file signatures
        if (headerPreview.startsWith('SUQz')) {

        } else if (headerPreview.startsWith('ftyp')) {

        } else if (headerPreview.startsWith('RIFF')) {

        } else {

        }
      } catch (headerError) {
      }

      // Try to read a small portion of the file to verify it's valid
      try {
        const fileContent = await RNFetchBlob.fs.readFile(tempFilePath, 'base64');
      } catch (readError) {
      }

      // Make API call to upload file using the correct endpoint with MediaBaseURL
      const url = `${MediaBaseURL}/common/upload`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer${store.getState().root.user.mediaToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 504) {
          throw new Error('Server took too long to respond. Please try again.');
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();

      if (responseData.ResponseStatus?.STATUSCODE === '200') {
        const uploadedUrl = responseData.Data?.Path || responseData.Data?.AbsolutePath;
        const duration = formatRecordingTime(actualRecordingDuration);

        setUploadedFileUrl(uploadedUrl);

        // Update the cart with audio description (similar to web implementation)
        const audioDescription = `${uploadedUrl}^${duration}`;

        // Optional: Show success message
        Alert.alert('Success', 'Audio file uploaded successfully!');
      } else {
        throw new Error(
          responseData.ResponseStatus?.MESSAGE || 'Upload failed',
        );
      }

    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload audio file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playUploadedAudio = async () => {
    if (!uploadedFileUrl) {
      Alert.alert('Error', 'No audio file to play');
      return;
    }

    try {
      // Stop any currently playing audio
      if (isPlayingAudio) {
        await audioRecorderPlayer.current.stopPlayer();
        setIsPlayingAudio(false);
        setAudioProgress(0);
        setAudioCurrentTime(0);
        return;
      }

      // Reset progress
      setAudioProgress(0);
      setAudioCurrentTime(0);

      // Set up audio session for playback
      try {
        // For iOS, add a small delay to ensure audio session is ready
        if (Platform.OS === 'ios') {
          await new Promise(resolve => setTimeout(() => resolve(undefined), 100));
        }
      } catch (error) {
      }

      // Create full URL
      const fullUrl = uploadedFileUrl.startsWith('http')
        ? uploadedFileUrl
        : `${MediaBaseURL}/${uploadedFileUrl}`;

      // For iOS, download the file first then use track player
      if (Platform.OS === 'ios') {
        try {
          const fileName = `audio_${Date.now()}.m4a`;
          const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

          // Download with progress tracking
          const downloadResult = await RNFS.downloadFile({
            fromUrl: fullUrl,
            toFile: filePath,
            background: true,
            progress: (res) => {

            },
          }).promise;

          if (downloadResult.statusCode === 200) {

            // Verify file exists and has content
            const fileExists = await RNFS.exists(filePath);
            if (!fileExists) {
              throw new Error('Downloaded file does not exist');
            }

            const fileStats = await RNFS.stat(filePath);
            if (fileStats.size < 1000) {
              throw new Error('Downloaded file is too small');
            }

            try {
              await playAudioWithTrackPlayer(filePath);
            } catch (trackPlayerError) {
              setIsPlayingAudio(false);
            }
          } else {
            throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
          }

        } catch (error) {
          setIsPlayingAudio(false);
        }
      } else {
        // Android implementation - use track player
        try {
          await playAudioWithTrackPlayer(fullUrl);
        } catch (error) {
          setIsPlayingAudio(false);
        }
      }
    } catch (error) {
    }
  };

  const stopAudio = async () => {
    if (isPlayingAudio) {
      try {
        // Stop track player
        // await TrackPlayerService.stop();

        // Clear progress interval
        if (progressIntervalRef.current) {
          // clearInterval(progressIntervalRef.current);
          // progressIntervalRef.current = null;
        }

        setIsPlayingAudio(false);
        setAudioProgress(0);
        setAudioCurrentTime(0);
      } catch (error) {
      }
    }
  };

  // Audio playback using react-native-track-player
  const playAudioWithTrackPlayer = async (audioUrl: string) => {
    try {

      // Setup track player if not already done
      // await TrackPlayerService.setupPlayer();

      // Wait a moment for setup to complete
      await new Promise(resolve => setTimeout(() => resolve(undefined), 200));

      // Reset any existing tracks
      // await TrackPlayerService.stop();

      // Wait a moment for reset to complete
      await new Promise(resolve => setTimeout(() => resolve(undefined), 200));

      // Add track to player
      // await TrackPlayerService.addTrack(audioUrl, 'Audio Recording');

      // Wait a moment for track to be loaded
      await new Promise(resolve => setTimeout(() => resolve(undefined), 500));

      // Get duration
      // const duration = await TrackPlayerService.getDuration();
      // setAudioDuration(duration);

      // Start playing  
      // await TrackPlayerService.play();
      setIsPlayingAudio(true);

      // Start progress tracking
      progressIntervalRef.current = setInterval(async () => {
        try {
          // const position = await TrackPlayerService.getPosition();
          // const currentDuration = await TrackPlayerService.getDuration();

          // setAudioCurrentTime(position);
          // const progress = currentDuration > 0 ? (position / currentDuration) * 100 : 0;
          // setAudioProgress(progress);

          // Check if playback finished
          // if (position >= currentDuration) {
          if (progressIntervalRef.current) {
            // clearInterval(progressIntervalRef.current);
            // progressIntervalRef.current = null;
          }
          setIsPlayingAudio(false);
          setAudioProgress(0);
          setAudioCurrentTime(0);
          // }
        } catch (error) {
        }
      }, 100);

      return true;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (OrderId) {
      getOrderDetail();
      GetVisitRecordList();
    }
  }, [OrderId]);

  const getOrderDetail = async () => {
    try {
      const payload = {
        "OrderId": OrderId,
      }

      const response = await profileService.getUserOrderDetail(payload);

      if (response.ResponseStatus.STATUSCODE == 200) {
        const OrderDetailArray = response.UserOrders;
        const groupedArray: any = groupArrayByUniqueIdAsArray(OrderDetailArray[0].OrderDetail);
        setShowGroupedArray(groupedArray);
        setCompleteOrderDetail(OrderDetailArray[0]);
      }

    } catch (error) {
    }
  }

  const GetVisitRecordList = async () => {
    try {
      const payload = {
        "OrderId": OrderId,
      }

      const response = await profileService.getVisitRecordList(payload);

      if (response.ResponseStatus.STATUSCODE == 200) {
        const VisitRecordList = response.Data;
        setVisitRecordList(VisitRecordList);
      }

    } catch (error) { 
    }
  }

  const groupArrayByUniqueIdAsArray = (dataArray: any) => {
    if (!Array.isArray(dataArray)) {
      return [];
    }

    const groupedObject: any = {};

    dataArray.forEach((obj) => {
      const uniqueId = `${obj.ServiceProviderUserloginInfoId}_${obj.OrganizationId}_${obj.PatientUserProfileInfoId}_${obj.CatCategoryId}`;

      if (!groupedObject[uniqueId]) {
        groupedObject[uniqueId] = [];
      }

      groupedObject[uniqueId].push(obj);
    });

    // Convert to array format with uniqueId as property
    return Object.keys(groupedObject).map(uniqueId => ({
      uniqueId: uniqueId,
      items: groupedObject[uniqueId]
    }));
  };

  const renderDoctorTag = ({ item, index }: { item: any; index: number }) => {
    const selectedItem = item.items[0];
    const imagePath = `${MediaBaseURL}${selectedItem.ServiceImage} || ${MediaBaseURL}${selectedItem.OrganizationImagePath}`;
    const name = selectedItem.ServiceProviderSName || selectedItem.OrganizationSlang;

    return (
      <View style={styles.doctorTagContainer}>
        <TouchableOpacity
          style={[styles.doctorTag, selectedIndex === index && styles.selectedTag]}
          onPress={() => setSelectedIndex(index)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: imagePath }} style={styles.doctorImage} />
          <View style={styles.doctorInfoCol}>
            <Text style={[styles.doctorName, selectedIndex === index && { color: '#fff' }]}>{t('service_provider')}</Text>
            <Text style={[styles.serviceName, selectedIndex === index && { color: '#fff' }]}>{name}</Text>
          </View>
        </TouchableOpacity>
        {/* Arrow below the tag */}
        {selectedIndex === index && <View style={[styles.arrowIndicatorSimple]}>
          <Text style={styles.arrowText}>▼</Text>
        </View>}
      </View>
    )
  }

  const createOrderMainBeforePayment = async () => {
    const payload = {
      "OrderId": CardArray[0].OrderID,
      "CatPlatformId": 1,
      "OrderDetail": generatePayloadforUpdateOrderMainBeforePayment(CardArray)
    }

    const response = await bookingService.updateOrderMainBeforePayment(payload);

    if (response.ResponseStatus.STATUSCODE == 200) {
      dispatch(setApiResponse(response.Data))

    } else {
      Alert.alert(response.ResponseStatus.MESSAGE)
    }
  }

  useEffect(() => {
    if (mobileNumber) {
      handlePhoneNumberChange({ phoneNumber: mobileNumber, isValid: isValidNumber, countryCode: '', fullNumber: '' });
    }
  }, [selectedCountry]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePhoneNumberChange = (data: { phoneNumber: string; isValid: boolean; countryCode: string; fullNumber: string }) => {
    setMobileNumber(data.phoneNumber);
    setIsValidNumber(data.isValid);
    setFullNumber(data.fullNumber);
  };

  // Function to calculate duration between start and end time
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';

    try {
      // Parse times (assuming format HH:mm)
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // Convert to total minutes
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      // Calculate difference
      const diffMinutes = endTotalMinutes - startTotalMinutes;

      if (diffMinutes <= 0) return '';

      // Convert to hours and minutes
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours} ساعة ${minutes} دقيقة`;
      } else if (hours > 0) {
        return `${hours} ساعة`;
      } else {
        return `${minutes} دقيقة`;
      }
    } catch (error) {
      return '';
    }
  };

  // Function to extract country code and phone number from full number
  const extractPhoneInfo = (fullNumber: string) => {
    if (!fullNumber) return { countryCode: 'SA', phoneNumber: '' };

    // Remove any spaces or special characters
    const cleanNumber = fullNumber.replace(/\s/g, '');

    // Check for Saudi Arabia number (+966)
    if (cleanNumber.startsWith('+966')) {
      const phoneNumber = cleanNumber.substring(4); // Remove +966
      return { countryCode: 'SA', phoneNumber };
    }

    // Check for other country codes (you can add more as needed)
    const countryCodeMap: { [key: string]: string } = {
      '+971': 'AE', // UAE
      '+973': 'BH', // Bahrain
      '+964': 'IQ', // Iraq
      '+98': 'IR',  // Iran
      '+962': 'JO', // Jordan
      '+965': 'KW', // Kuwait
      '+961': 'LB', // Lebanon
      '+968': 'OM', // Oman
      '+970': 'PS', // Palestine
      '+974': 'QA', // Qatar
      '+963': 'SY', // Syria
      '+90': 'TR',  // Turkey
      '+967': 'YE'  // Yemen
    };

    for (const [code, country] of Object.entries(countryCodeMap)) {
      if (cleanNumber.startsWith(code)) {
        const phoneNumber = cleanNumber.substring(code.length);
        return { countryCode: country, phoneNumber };
      }
    }

    // Default to Saudi Arabia if no match found
    return { countryCode: 'SA', phoneNumber: cleanNumber.replace(/^\+/, '') };
  };

  // Extract phone info from user
  const phoneInfo = extractPhoneInfo(user?.CellNumber || '');
  const defaultCountryCode = phoneInfo.countryCode;
  const defaultPhoneNumber = phoneInfo.phoneNumber;

  // Helper to format time
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('order_detail')}</Text>
      }
      leftComponent={
        <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
          <ArrowRightIcon />
        </TouchableOpacity>
      }
      containerStyle={styles.headerContainer}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 16 }}>
        <View style={{ height: 120 }}>
          {/* Doctor tags */}
          <FlatList
            data={showGroupedArray}
            renderItem={renderDoctorTag}
            keyExtractor={(item, index) => `doctor-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        {selectedDoctor?.uniqueId && <ScrollView style={{ flex: 1 }}>
          {
            selectedDoctor?.items?.map((item: any, index: number) => {
              let displayDate = '';
              let displayTime = '';

              let visitRecord = [];
              if (item?.TaskMainId) {
                visitRecord = visitRecordList.filter((visit: any) => visit.TaskMainId == item.TaskMainId);
              }

              if (item.SchedulingDate && item.SchedulingTime) {
                const datePart = item.SchedulingDate.split('T')[0];
                const utcDateTime = moment.utc(`${datePart}T${item.SchedulingTime}:00Z`);
                if (utcDateTime.isValid()) {
                  const localDateTime = utcDateTime.local();
                  displayDate = localDateTime.format('DD/MM/YYYY');
                  displayTime = localDateTime.format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
                }
              }

              return (
                <>
                  {/* Order Information */}
                  <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                    <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>معلومات الطلب</Text>
                      <TouchableOpacity style={{ height: 35, width: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dc3545', borderRadius: 10 }}>
                        <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>إلغاء الحجز</Text>
                      </TouchableOpacity>

                    </View>
                    <View style={{ paddingTop: 5, width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>تاريخ الطلب</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{displayDate}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>رقم الطلب</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{item.OrderId}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>مقدم الطلب</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{item.FullNameSlang}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>رقم الجوال</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{item.PhoneNumber}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, paddingTop: 5 }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>حالة الطلب</Text>

                      {/* Order Status Component */}
                      <View style={styles.orderStatusContainer}>
                        {/* Other Orders Status */}
                        {item?.CatOrderStatusId != 24 && item?.CatOrderStatusId != 9 && item?.CatOrderStatusId != 4 && (
                          <View style={styles.orderStatusSection}>
                            <View style={styles.statusItem}>
                              {item?.CatOrderStatusId == 1 && (
                                <View style={styles.statusDot}>
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                              <Text style={[styles.statusText, item?.CatOrderStatusId == 1 && styles.activeStatusText]}>تم حجز الخدمة</Text>
                            </View>
                            <View style={styles.statusItem}>
                              {item?.CatOrderStatusId == 17 && (
                                <View style={styles.statusDot}>
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                              <Text style={[styles.statusText, item?.CatOrderStatusId == 17 && styles.activeStatusText]}>قبول الطلب</Text>
                            </View>
                            <View style={styles.statusItem}>
                              {item?.CatOrderStatusId == 7 && (
                                <View style={styles.statusDot}>
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                              <Text style={[styles.statusText, item?.CatOrderStatusId == 7 && styles.activeStatusText]}>الممارس الصحي في طريقه اليك</Text>
                            </View>
                            <View style={styles.statusItem}>
                              {item?.CatOrderStatusId == 8 && (
                                <View style={styles.statusDot}>
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                              <Text style={[styles.statusText, item?.CatOrderStatusId == 8 && styles.activeStatusText]}>تم تلقي الخدمة</Text>
                            </View>
                            <View style={styles.statusItem}>
                              {item?.CatOrderStatusId == 10 && (
                                <View style={styles.statusDot}>
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                              <Text style={[styles.statusText, item?.CatOrderStatusId == 10 && styles.activeStatusText]}>اكتملت الخدمة</Text>
                            </View>
                          </View>
                        )}

                        {/* Cancelled Orders Status */}
                        {(item?.CatOrderStatusId == 9 || item?.CatOrderStatusId == 4) && (
                          <View style={styles.orderStatusSection}>
                            <View style={styles.statusItem}>
                              {item?.CatOrderStatusId == 9 && (
                                <View style={styles.statusDot}>
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                              <Text style={[styles.statusText, item?.CatOrderStatusId == 9 && styles.cancelledStatusText]}>تم إلغاء الخدمة</Text>
                            </View>
                            <View style={styles.statusItem}>
                              {item?.CatOrderStatusId == 4 && (
                                <View style={styles.statusDot}>
                                  <Icon name="check" size={16} color="#fff" />
                                </View>
                              )}
                              <Text style={[styles.statusText, item?.CatOrderStatusId == 4 && styles.cancelledStatusText]}>تم استرداد المبلغ</Text>
                            </View>
                          </View>
                        )}

                        {/* Missed Orders Status */}
                        {item?.CatOrderStatusId == 24 && (
                          <View style={styles.orderStatusSection}>
                            <View style={styles.statusItem}>
                              <View style={styles.statusDot}>
                                <Icon name="check" size={16} color="#fff" />
                              </View>
                              <Text style={[styles.statusText, styles.missedStatusText]}>فاتت</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  {/* Selected Service */}
                  <View style={styles.detailsCard}>

                    <View style={styles.detailsHeader}>
                      <Text style={styles.detailsHeaderText}>الخدمات المختارة (1)</Text>
                    </View>
                    <View style={styles.selectedServiceRow}>
                      {item?.CatCategoryId == "42"
                        ? <Text style={styles.selectedServiceText}>{`استشارة عن بعد / ${String(item?.ServiceTitleSlang || item?.TitleSlang || '')}`}</Text>
                        : <Text style={styles.selectedServiceText}>{String(item?.ServiceTitleSlang || item?.TitleSlang || '')}</Text>
                      }
                      <View style={styles.selectedServiceCircle}><Text style={styles.selectedServiceCircleText}>1</Text></View>
                    </View>
                    {/* Session info with icons */}
                    <View style={styles.sessionInfoDetailsContainer}>
                      <View style={styles.sessionInfoDetailItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <CalendarIcon width={18} height={18} />
                          <Text style={styles.sessionInfoLabel}>تاريخ الزيارة</Text>
                        </View>
                        <Text style={styles.sessionInfoValue}>{displayDate}</Text>
                      </View>
                      <View style={styles.sessionInfoDetailItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <ClockIcon width={18} height={18} />
                          <Text style={styles.sessionInfoLabel}>توقيت الزيارة</Text>
                        </View>
                        <Text style={styles.sessionInfoValue}>{displayTime}</Text>
                      </View>
                      <View style={styles.sessionInfoDetailItem}>
                        <View style={{ width: '30%', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <SettingIconSelected width={18} height={18} />
                          <Text style={styles.sessionInfoLabel}>موقع الزيارة</Text>
                        </View>
                        <View style={{ width: '70%' }}>
                          <Text style={styles.sessionInfoValue}>{item?.Address}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {/* Patient Information */}
                  <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                    <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>معلومات المستفيد (المريض)</Text>

                    </View>
                    <View style={{ paddingTop: 5, width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الأسم</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{item.FullNameSlang}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>صلة القرابة</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{item.RelationSLang}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الاقامة</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{item.CatNationalityId == 213 ? 'مواطن' : 'مقيم'}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>رقم الهوية</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{item.IDNumber}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                      <TouchableOpacity style={{ width: '48%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>بيانات المستفيد</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ width: '48%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>التاريخ المرضي</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{ width: '94%', marginHorizontal: 10, height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>التقارير الطبية</Text>
                    </TouchableOpacity>
                  </View>
                  {/* payment Information */}
                  <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                    <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>معلومات الدفع</Text>
                    </View>
                    <View style={{ width: '100%', justifyContent: 'space-between', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: 'left' }]}>طريقة الدفع</Text>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', textAlign: 'left' }]}>{completeOrderDetail?.CardNumber ? 'بطاقة الائتمان' : 'محفظة'}</Text>
                    </View>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: 'left', paddingHorizontal: 10 }]}>الفاتورة</Text>
                    <View style={{ paddingTop: 5, width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>اجمالى الخدمات</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{`SAR ${item?.PriceChargedWithoutTax?.toFixed(2)}`}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الضريبة (15%)</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{`SAR ${item?.TaxAmt?.toFixed(2)}`}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>المجموع</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>{`SAR ${item?.PriceCharged?.toFixed(2)}`}</Text>
                    </View>

                  </View>
                  {/* payment Information */}
                  <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                    <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>سجل الجلسة / الخطة العلاجية</Text>
                    </View>
                    {visitRecord && (
                      <View style={{ padding: 10, borderRadius: 10 }}>
                        <FlatList
                          data={visitRecord}
                          renderItem={({ item }) => (
                            <View style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                  <Text style={{ fontFamily: CAIRO_FONT_FAMILY.medium, color: '#333', textAlign: 'left' }}>اسم المستفيد</Text>
                                  <Text style={{ fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: 'left' }}>{item.PatientFullNameSLang}</Text>
                                </View>
                                <View style={{ height: 50, width: 50, backgroundColor: 'lightgray', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                  <Image source={{ uri: `${MediaBaseURL}${item.LogoImagePath}` }} style={{ height: '100%', width: '100%', borderRadius: 10 }} />
                                </View>
                              </View>
                              <View style={{ borderRadius: 10, marginTop: 10 }}>
                                <View style={styles.sessionInfoDetailItem}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <CalendarIcon width={18} height={18} />
                                    <Text style={styles.sessionInfoLabel}>المركز الطبى</Text>
                                  </View>
                                  <Text style={styles.sessionInfoValue}>{item.TitleSlang}</Text>
                                </View>
                                <View style={styles.sessionInfoDetailItem}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <ClockIcon width={18} height={18} />
                                    <Text style={styles.sessionInfoLabel}>مقدم الرعاية</Text>
                                  </View>
                                  <Text style={styles.sessionInfoValue}>{item.FullnameSlang}</Text>
                                </View>
                                <View style={styles.sessionInfoDetailItem}>
                                  <View style={{ width: '30%', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <SettingIconSelected width={18} height={18} />
                                    <Text style={styles.sessionInfoLabel}>تاريخ الزيارة</Text>
                                  </View>
                                  <View style={{ width: '70%' }}>
                                    <Text style={styles.sessionInfoValue}>{moment(item.VisitDate).locale('en').format('DD/MM/YYYY')}</Text>
                                  </View>
                                </View>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                <TouchableOpacity style={{ width: '48%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>سجل الزيارة</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ width: '48%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>وصفة طبية</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                          ListEmptyComponent={() => (
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                              <Text style={{ fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: 'center' }}>لا يوجد سجل جلسة</Text>
                            </View>
                          )}
                          keyExtractor={(item) => item.Id.toString()}
                        />
                      </View>
                    )}

                  </View>
                  {/* Rating Information */}
                  <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                    <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>إستبيان مدى رضاك عن الخدمة</Text>
                    </View>
                    <View style={{ padding: 10, borderRadius: 10 }}>
                      <Text style={{ fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: 'center' }}>يمهنا رائيك لتحسين خدمتنا بإستمرار قم بالإجابة على الإستبيان التالي</Text>
                      <TouchableOpacity style={{ width: '100%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>بدء الإستبيان</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )
            })
          }
        </ScrollView>}



      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    ...globalTextStyles.h5,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...globalTextStyles.bodyMedium,
    color: '#666',
    textAlign: 'center',
  },
  tagsContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  doctorTagContainer: {
    position: 'relative',
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
    backgroundColor: '#23a2a4',
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
    ...globalTextStyles.bodyMedium,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#333',
    marginBottom: 2,
    textAlign: 'left',
  },
  serviceName: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    textAlign: 'left',
  },
  separator: {
    width: 8,
  },
  detailsCard: {
    backgroundColor: '#F6FAF9',
    borderRadius: 12,
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
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 10,
  },
  detailsHeaderText: {
    ...globalTextStyles.bodyMedium,
    fontFamily: CAIRO_FONT_FAMILY.bold,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    ...globalTextStyles.bodyMedium,
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
    marginHorizontal: 10,
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
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  selectedServiceText: {
    ...globalTextStyles.bodyMedium,
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  sessionInfoTitle: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  sessionInfoDetailsContainer: {
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 16,
    gap: 8,
  },
  sessionInfoDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfoLabel: {
    ...globalTextStyles.bodySmall,
    color: '#888',
    marginBottom: 2,
    marginLeft: 2,
  },
  sessionInfoValue: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.bold,
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
    ...globalTextStyles.bodyMedium,
    color: '#179c8e',
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
  },
  nextButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#FFFFFF',
    fontFamily: CAIRO_FONT_FAMILY.semiBold,
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
  arrowIndicator: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  arrowText: {
    ...globalTextStyles.h4,
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  arrowIndicatorSimple: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  // Order Status Styles
  orderStatusContainer: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  orderStatusSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statusDot: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: '#23a2a4',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    ...globalTextStyles.bodySmall,
    color: '#666',
  },
  activeStatusText: {
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  cancelledStatusText: {
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  missedStatusText: {
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
});

export default OrderDetailScreen; 