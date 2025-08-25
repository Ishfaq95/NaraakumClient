import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity,SafeAreaView, ScrollView, TextInput, Alert, PermissionsAndroid, Platform, TouchableWithoutFeedback, Keyboard, Share } from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
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
// import { TrackPlayerService } from '../../services/TrackPlayerService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import { profileService } from '../../services/api/ProfileService';
import Header from '../../components/common/Header';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import CustomBottomSheet from '../../components/common/CustomBottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Dropdown from '../../components/common/Dropdown';
import UniversalImage from '../../components/common/UniversalImage';
import { AddBeneficiaryComponent } from '../../components/emailUpdateComponent';
import { generatePrescriptionPDF, generateVisitHistoryPDF } from '../../components/GeneratePDF/VisitConsultantLog';
// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';
// @ts-ignore
import RNFS from 'react-native-fs';
import RatingVector from '../../assets/icons/ratingVector';
import FullScreenLoader from '../../components/FullScreenLoader';

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
  const [medicalReportListBottomSheet, setMedicalReportListBottomSheet] = useState(false);

  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const apiResponse = useSelector((state: any) => state.root.booking.apiResponse);
  const [showGroupedArray, setShowGroupedArray] = useState([]);
  const [completeOrderDetail, setCompleteOrderDetail] = useState<any>([]);
  const [medicalHistoryBottomSheet, setMedicalHistoryBottomSheet] = useState(false);
  const selectedDoctor: any = showGroupedArray[selectedIndex];
  const dispatch = useDispatch();
  const [visitRecordList, setVisitRecordList] = useState<any>([]);
  const [medicalComplaint, setMedicalComplaint] = useState('');
  const [sufferingDuration, setSufferingDuration] = useState('');
  const [isRecurring, setIsRecurring] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isSmoking, setIsSmoking] = useState('');
  const [familyMedicalProblems, setFamilyMedicalProblems] = useState('');
  const [openBeneficiaryBottomSheet, setOpenBeneficiaryBottomSheet] = useState(false);
  const [addmedicalReportBottomSheet, setAddmedicalReportBottomSheet] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [medicalData, setMedicalData] = useState<any>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    relation: '',
    age: '',
    gender: '',
    insurance: '',
    nationality: 'citizen',
    idNumber: '',
  })

  // Medical report form states
  const [medicalReportType, setMedicalReportType] = useState('others');
  const [medicalReportFile, setMedicalReportFile] = useState<any>(null);
  const [medicalReportFileName, setMedicalReportFileName] = useState('');
  const [medicalReportDescription, setMedicalReportDescription] = useState('');

  // Error states for validation
  const [medicalComplaintError, setMedicalComplaintError] = useState('');
  const [sufferingDurationError, setSufferingDurationError] = useState('');
  const [isRecurringError, setIsRecurringError] = useState('');
  const [allergiesError, setAllergiesError] = useState('');
  const [medicalReportTypeError, setMedicalReportTypeError] = useState('');
  const [medicalReportFileError, setMedicalReportFileError] = useState('');
  const [medicalReportFileNameError, setMedicalReportFileNameError] = useState('');
  const [isSmokingError, setIsSmokingError] = useState('');
  const [familyMedicalProblemsError, setFamilyMedicalProblemsError] = useState('');
  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const ratingScrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [medicalCenterRating, setMedicalCenterRating] = useState(0);
  const [timingRating, setTimingRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [comment, setComment] = useState('');
  const [medicalReportList, setMedicalReportList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visitHistoryData, setVisitHistoryData] = useState<any>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

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
    const payload = {
      "UserloginInfoId": user?.Id,
      "Comment": comment,
      "OrderId": selectedDoctor?.items[0]?.OrderId,
      "RelationOrderAndOrganizationCategoryId": selectedDoctor?.items[0]?.RelationOrderAndOrganizationCategoryId,
      "OrganizationId": selectedDoctor?.items[0]?.OrganizationId,
      "Rating": [
        { "TargetId": selectedDoctor?.items[0]?.CatServiceId, "CatRatingTypeId": 1, "RatingValue": medicalCenterRating },
        { "TargetId": selectedDoctor?.items[0]?.ServiceProviderUserloginInfoId, "CatRatingTypeId": 2, "RatingValue": timingRating },
        { "TargetId": selectedDoctor?.items[0]?.ServiceProviderUserloginInfoId, "CatRatingTypeId": 3, "RatingValue": staffRating }],
      "VisitMainId": selectedDoctor?.items[0]?.VisitMainId,
      "TaskMainId": selectedDoctor?.items[0]?.TaskMainId
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

  const getMedicalReportList = async () => {
    setMedicalReportList([])
    const payload = {
      "PatientId": selectedDoctor?.items[0]?.PatientUserProfileInfoId,
      "OrderId": selectedDoctor?.items[0]?.OrderId,
    }
    const response = await profileService.getMedicalReport(payload)
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setMedicalReportListBottomSheet(true)
      setMedicalReportList(response.PatientFiles)
    }
  }

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
    const imagePath = selectedItem.ServiceProviderImage ? `${MediaBaseURL}${selectedItem.ServiceProviderImage}` : selectedItem.ServiceImage ? `${MediaBaseURL}${selectedItem.ServiceProviderImage}` : `${MediaBaseURL}${selectedItem.OrganizationImagePath}`;
    const name = selectedItem.ServiceProviderSName || selectedItem.OrganizationSlang;

    return (
      <View style={styles.doctorTagContainer}>
        <TouchableOpacity
          style={[styles.doctorTag, selectedIndex === index && styles.selectedTag]}
          onPress={() => setSelectedIndex(index)}
          activeOpacity={0.8}
        >
          <UniversalImage source={{ uri: imagePath }} style={styles.doctorImage} />
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

  const handleMedicalHistoryBottomSheet = (item: any) => {
    getMedicalHistory(item)
  }

  const closeMedicalHistoryBottomSheet = () => {
    setMedicalHistoryBottomSheet(false);
    // Clear all form errors when closing
    setMedicalComplaintError('');
    setSufferingDurationError('');
    setIsRecurringError('');
    setAllergiesError('');
    setIsSmokingError('');
    setFamilyMedicalProblemsError('');
    // Clear all form data when closing
    setMedicalComplaint('');
    setSufferingDuration('');
    setIsRecurring('');
    setAllergies('');
    setIsSmoking('');
    setFamilyMedicalProblems('');
  }

  // Form validation function
  const validateAndSaveForm = () => {
    // Clear previous errors
    setMedicalComplaintError('');
    setSufferingDurationError('');
    setIsRecurringError('');
    setAllergiesError('');
    setIsSmokingError('');
    setFamilyMedicalProblemsError('');

    let isValid = true;

    // Validate Medical Complaint
    if (!medicalComplaint.trim()) {
      setMedicalComplaintError('يرجى إدخال الشكوى الطبية');
      isValid = false;
    }

    // Validate Duration of Suffering
    if (!sufferingDuration.trim()) {
      setSufferingDurationError('يرجى إدخال مدة المعاناة');
      isValid = false;
    }

    // Validate Is Recurring
    if (!isRecurring) {
      setIsRecurringError('يرجى اختيار ما إذا كانت المشكلة متكررة');
      isValid = false;
    }

    // Validate Allergies
    if (!allergies.trim()) {
      setAllergiesError('يرجى إدخال معلومات الحساسية');
      isValid = false;
    }

    // Validate Smoking Status
    if (!isSmoking) {
      setIsSmokingError('يرجى اختيار حالة التدخين');
      isValid = false;
    }

    // Validate Family Medical Problems
    if (!familyMedicalProblems.trim()) {
      setFamilyMedicalProblemsError('يرجى إدخال المشاكل الطبية العائلية');
      isValid = false;
    }

    if (isValid) {
      // Form is valid, proceed with saving
      // Here you can add your API call to save the form data
      Alert.alert('نجح', 'تم حفظ البيانات بنجاح');
    }
    // No alert on error - just red highlighting will show
  };

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

  const getMedicalHistory = async (item: any) => {
    setMedicalData([])
    const payload = {
      "PatientId": item.PatientUserProfileInfoId,
      "OrderId": item.OrderId,
    }
    const response = await profileService.getMedicalHistory(payload)
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setMedicalData(response.Patient)
      if (response.Patient.length == 0) {
        setMedicalHistoryBottomSheet(true);
      }
    }
  }

  useEffect(() => {
    if (medicalData?.length > 0) {
      setMedicalComplaint(medicalData[0].MedicalComplaint)
      setSufferingDuration(medicalData[0].MedicalComplaintSufferingLast)
      setIsRecurring(medicalData[0].isRepetitive == 1 ? 'yes' : 'no')
      setAllergies(medicalData[0].Allergies)
      setIsSmoking(medicalData[0].isSmoke == 1 ? 'yes' : 'no')
      setFamilyMedicalProblems(medicalData[0].FamilyMedicalHistory)
      setMedicalHistoryBottomSheet(true);
    }
  }, [medicalData])

  const updateBeneficiaryField = (field: string, value: string) => {
    setBeneficiaryForm(prev => ({ ...prev, [field]: value }));
  }

  const onPressBeneficiary = (item: any) => {
    setBeneficiaryForm({
      name: item.FullNameSlang || '',
      age: item.Age || '',
      relation: item.CatRelationShipId || '',
      gender: item.Gender == 1 ? 'male' : 'female',
      insurance: item.CatInsuranceCompanyId || '',
      nationality: item.CatNationalityId == 213 ? 'citizen' : 'resident',
      idNumber: item.CatNationalityId == 213 && item.IDNumber ? item.IDNumber : '',
    });
    setOpenBeneficiaryBottomSheet(true);
  }

  const HandleSubmitFormData = async () => {
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
      "UserProfileId": selectedDoctor?.items[0]?.PatientUserProfileInfoId,
    }
    const response = await bookingService.updateBeneficiaryData(Payload)
    setOpenBeneficiaryBottomSheet(false)
  }

  const updateMedicalHistory = async () => {
    const Payload = {
      "PatientId": selectedDoctor?.items[0]?.PatientUserProfileInfoId,
      "OrderId": selectedDoctor?.items[0]?.OrderId,
      "MedicalComplaint": medicalComplaint,
      "isRepetitive": isRecurring == 'yes' ? 1 : 0,
      "MedicalComplaintSufferingLast": sufferingDuration,
      "isSmoke": isSmoking == 'yes' ? 1 : 0,
      "Allergies": allergies,
      "FamilyMedicalHistory": familyMedicalProblems,
    }
    
    const response = await profileService.updateMedicalHistory(Payload)
    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setMedicalHistoryBottomSheet(false);
    }
  }

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
      formData.append('ResourceType', '9');

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
        setMedicalReportFile(responseData.Data.Path)
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

  const pickMedicalReportFile = async () => {
    try {
      const pickerResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      if (pickerResult && pickerResult.length > 0) {

        const file = {
          uri: pickerResult[0].uri,
          type: pickerResult[0].type || 'application/octet-stream',
          name: pickerResult[0].name,
          size: pickerResult[0].size,
        };

        await uploadFile(file, pickerResult);
      }
    } catch (err) {
      // Check if user cancelled the picker
      if (err && typeof err === 'object' && 'code' in err && err.code === 'E_DOCUMENT_PICKER_CANCELED') {
        return;
      }
      console.error('Error picking file:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الملف');
    }
  };

  const clearMedicalReportForm = () => {
    setMedicalReportType('others');
    setMedicalReportFile(null);
    setMedicalReportFileName('');
    setMedicalReportDescription('');
    setMedicalReportTypeError('');
    setMedicalReportFileError('');
    setMedicalReportFileNameError('');
  };

  const getFileName = (url: string) => {
    const fileName = url.split('/').pop();
    return fileName;
  };

  const addMedicalReport = async () => {
    const payload = {
      "UserProfileInfoId": selectedDoctor?.items[0]?.PatientUserProfileInfoId,
      "OrderId": selectedDoctor?.items[0]?.OrderId,
      "Files": [{
        "CatFileTypeId": "1",
        "CatPatientUploadedFileTypeId": "7",
        "FileName": medicalReportFileName,
        "FilePath": medicalReportFile
      }]
    }
    const response = await bookingService.UploadMedicalhistoryReports(payload);
    if (response.ResponseStatus.STATUSCODE == 200) {
      setMedicalReportFile(null);
      setMedicalReportFileName('');
      setMedicalReportDescription('');
      setMedicalReportTypeError('');
      setMedicalReportFileError('');
      setMedicalReportFileNameError('');
      setAddmedicalReportBottomSheet(false);
    }
  }

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

  const downloadMedicalReport = async (item: any) => {
    downloadFileFromReport(item.FilePath)
  }

  const removeMedicalReport = async (item: any) => {
    const payload = {
      "PatientUploadedFileId": item.Id,
    }
    const response = await profileService.deleteMedicalReport(payload)
    if (response.ResponseStatus.STATUSCODE == 200) {
      getMedicalReportList()
    }
  }

  const handleAddPress = () => {
    setMedicalReportListBottomSheet(false)
    setAddmedicalReportBottomSheet(true)
  }

  const renderMedicalItem = ({ item }: any) => {
    if (item.OrderId == null) {
      return null
    }
    return (
      <View style={{ padding: 10, borderWidth: 1, backgroundColor: '#fff', borderColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', textAlign: 'left' }]}>{item.CPFullnameSlang || item.FileName || ''}</Text>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => downloadMedicalReport(item)} style={{ height: 40, width: '48%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Text style={[globalTextStyles.bodyMedium, { color: '#fff' }]}>{'تحميل الملف'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeMedicalReport(item)} style={{ height: 40, width: '48%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Text style={[globalTextStyles.bodyMedium, { color: '#fff' }]}>{'إزالة الملف'}</Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 16 }}>
        <View style={{ height: 120, width: "100%", alignItems: "flex-start" }}>
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
                  displayDate = localDateTime.locale('en').format('DD/MM/YYYY');
                  displayTime = localDateTime.locale('en').format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
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
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>تاريخ الطلب</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{displayDate}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>رقم الطلب</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{item.OrderId}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>مقدم الطلب</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{item.FullNameSlang}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>رقم الجوال</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{item.PhoneNumber}</Text>
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
                      {/* <View style={styles.sessionInfoDetailItem}>
                        <View style={{ width: '30%', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <SettingIconSelected width={18} height={18} />
                          <Text style={styles.sessionInfoLabel}>موقع الزيارة</Text>
                        </View>
                        <View style={{ width: '70%', alignItems: "flex-end" }}>
                          <Text style={styles.sessionInfoValue}>{item?.Address}</Text>
                        </View>
                      </View> */}
                    </View>
                  </View>
                  {/* Patient Information */}
                  <View style={{ paddingBottom: 10, width: '100%', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                    <View style={{ height: 45, width: '100%', backgroundColor: '#e4f1ef', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333' }]}>معلومات المستفيد (المريض)</Text>

                    </View>
                    <View style={{ paddingTop: 5, width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>الأسم</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{item.FullNameSlang}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>صلة القرابة</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{item.RelationSLang ? item.RelationSLang : 'نفسي'}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>الاقامة</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{item.CatNationalityId == 213 ? 'مواطن' : 'مقيم'}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f', width: "30%" }]}>رقم الهوية</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: "right", width: "70%", flexWrap: "wrap" }]}>{item.IDNumber}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => onPressBeneficiary(item)} disabled={item?.PatientUserProfileInfoId == user?.UserProfileInfoId} style={[{ width: '48%', height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, item?.PatientUserProfileInfoId == user?.UserProfileInfoId ? { backgroundColor: '#179c8e', opacity: 0.5 } : { backgroundColor: '#179c8e', }]}>
                        <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>بيانات المستفيد</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMedicalHistoryBottomSheet(item)} style={{ width: '48%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>التاريخ المرضي</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => getMedicalReportList()} style={{ width: '94%', marginHorizontal: 10, height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>التقارير الطبية</Text>
                    </TouchableOpacity>
                    <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.medium, color: 'red', textAlign: 'left', paddingHorizontal: 10,marginTop:10 }]}>اكمل معلومات المستفيد ( اختيارى)</Text>
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
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.medium, color: '#333' }]}>{`SAR ${item?.PriceChargedWithoutTax?.toFixed(2)}`}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, }}>
                      <Text style={[globalTextStyles.bodyMedium, { color: '#36454f' }]}>الضريبة (15%)</Text>
                      <Text style={[globalTextStyles.bodyMedium, { fontFamily: CAIRO_FONT_FAMILY.medium, color: '#333' }]}>{`SAR ${item?.TaxAmt?.toFixed(2)}`}</Text>
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
                              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                                <View style={{ width: '75%' }}>
                                  <Text style={{ fontFamily: CAIRO_FONT_FAMILY.medium, color: '#333', textAlign: 'left' }}>اسم المستفيد</Text>
                                  <Text style={{ fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: 'left' }}>{item.PatientFullNameSLang}</Text>
                                </View>
                                <View style={{ height: 50, width: 50, backgroundColor: 'lightgray', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                  <UniversalImage source={{ uri: `${MediaBaseURL}${item.LogoImagePath}` }} style={{ height: '100%', width: '100%', borderRadius: 10 }} />
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
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <SettingIconSelected width={18} height={18} />
                                    <Text style={styles.sessionInfoLabel}>تاريخ الزيارة</Text>
                                  </View>
                                  <View style={{ }}>
                                    <Text style={styles.sessionInfoValue}>{moment(item.VisitDate).locale('en').format('DD/MM/YYYY')}</Text>
                                  </View>
                                </View>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                <TouchableOpacity onPress={() => getVisitMainRecordDetails(item, 'visit')} style={{ width: '48%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>سجل الزيارة</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => getVisitMainRecordDetails(item, 'medicine')} style={{ width: '48%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
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
                      <View style={{ height: 120, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <RatingVector width={200} height={200} color="#179c8e" />
                      </View>
                      <Text style={{ fontFamily: CAIRO_FONT_FAMILY.bold, color: '#333', textAlign: 'center' }}>يمهنا رائيك لتحسين خدمتنا بإستمرار قم بالإجابة على الإستبيان التالي</Text>
                      <TouchableOpacity onPress={() => setIsRatingVisible(true)} style={{ width: '100%', height: 50, backgroundColor: '#179c8e', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={[globalTextStyles.bodyMedium, { color: '#fff', fontFamily: CAIRO_FONT_FAMILY.bold }]}>بدء الإستبيان</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )
            })
          }
        </ScrollView>}

        <CustomBottomSheet
          visible={medicalHistoryBottomSheet}
          onClose={() => setMedicalHistoryBottomSheet(false)}
          showHandle={false}
          height="65%"
        >
          <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
              <Text style={styles.bottomSheetHeaderText}>التاريخ المرضي</Text>
              <TouchableOpacity onPress={closeMedicalHistoryBottomSheet}>
                <AntDesign name="close" size={24} color="#979e9eff" />
              </TouchableOpacity>

            </View>
            <ScrollView
              style={{ flex: 1 }}
              // contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <View style={styles.formContainer}>
                      {/* Medical Complaint */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>ماهي شكواك الطبيه</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <TextInput
                          style={[styles.multilineTextInput, medicalComplaintError && styles.inputError]}
                          placeholder="اكتب التفاصيل"
                          placeholderTextColor="#999"
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                          textAlign="right"
                          value={medicalComplaint}
                          onChangeText={(text) => {
                            setMedicalComplaint(text);
                            if (medicalComplaintError) setMedicalComplaintError('');
                          }}
                        />
                        {medicalComplaintError && <Text style={styles.errorText}>{medicalComplaintError}</Text>}
                      </View>

                      {/* Duration of Suffering */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>كم مدة المعاناه</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <TextInput
                          style={[styles.textInput, sufferingDurationError && styles.inputError]}
                          placeholder="اكتب المدة"
                          placeholderTextColor="#999"
                          textAlign="right"
                          value={sufferingDuration}
                          onChangeText={(text) => {
                            setSufferingDuration(text);
                            if (sufferingDurationError) setSufferingDurationError('');
                          }}
                        />
                        {sufferingDurationError && <Text style={styles.errorText}>{sufferingDurationError}</Text>}
                      </View>

                      {/* Is it recurring */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>هل هي متكرره</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <Dropdown
                          data={[
                            { label: 'نعم', value: 'yes' },
                            { label: 'لا', value: 'no' },
                            { label: 'أحياناً', value: 'sometimes' }
                          ]}
                          value={isRecurring}
                          onChange={(value) => {
                            setIsRecurring(value.toString());
                            if (isRecurringError) setIsRecurringError('');
                          }}
                          placeholder="اختر الإجابة"
                          containerStyle={[styles.dropdownContainer, isRecurringError && styles.inputError]}
                        />
                        {isRecurringError && <Text style={styles.errorText}>{isRecurringError}</Text>}
                      </View>

                      {/* Allergies */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>هل لديك حساسيه ؟</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <TextInput
                          style={[styles.textInput, allergiesError && styles.inputError]}
                          placeholder="علاج او اكل او شرب او صبغه"
                          placeholderTextColor="#999"
                          textAlign="right"
                          value={allergies}
                          onChangeText={(text) => {
                            setAllergies(text);
                            if (allergiesError) setAllergiesError('');
                          }}
                        />
                        {allergiesError && <Text style={styles.errorText}>{allergiesError}</Text>}
                      </View>

                      {/* Smoking */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>هل تدخن ؟</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <Dropdown
                          data={[
                            { label: 'نعم', value: 'yes' },
                            { label: 'لا', value: 'no' },
                            { label: 'أقلعت', value: 'quit' }
                          ]}
                          value={isSmoking}
                          onChange={(value) => {
                            setIsSmoking(value.toString());
                            if (isSmokingError) setIsSmokingError('');
                          }}
                          placeholder="اختر الإجابة"
                          containerStyle={[styles.dropdownContainer, isSmokingError && styles.inputError]}
                        />
                        {isSmokingError && <Text style={styles.errorText}>{isSmokingError}</Text>}
                      </View>

                      {/* Family Medical Problems */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>هل هناك مشاكل طبيه في الأسره ؟</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <TextInput
                          style={[styles.multilineTextInput, familyMedicalProblemsError && styles.inputError]}
                          placeholder="اكتب التفاصيل"
                          placeholderTextColor="#999"
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                          textAlign="right"
                          value={familyMedicalProblems}
                          onChangeText={(text) => {
                            setFamilyMedicalProblems(text);
                            if (familyMedicalProblemsError) setFamilyMedicalProblemsError('');
                          }}
                        />
                        {familyMedicalProblemsError && <Text style={styles.errorText}>{familyMedicalProblemsError}</Text>}
                      </View>

                      {/* Buttons */}
                      <View style={styles.formButtonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={updateMedicalHistory}>
                          <Text style={styles.saveButtonText}>حفظ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => generateMedicalHistoryPDF(medicalData[0])} disabled={medicalData?.length == 0} style={[styles.downloadButton, medicalData?.length > 0 && { backgroundColor: "#fff", borderColor: '#179c8e', borderWidth: 1 }]}>
                          <Text style={[styles.downloadButtonText, medicalData?.length > 0 && { color: '#179c8e' }]}>تم تنزيل السجل الطبي بصيغة PDF</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </CustomBottomSheet>

        <CustomBottomSheet
          visible={openBeneficiaryBottomSheet}
          onClose={() => setOpenBeneficiaryBottomSheet(false)}
          showHandle={false}
          height="65%"
        >
          <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
              <Text style={styles.bottomSheetHeaderText}>بيانات المستفيد</Text>
              <TouchableOpacity onPress={() => setOpenBeneficiaryBottomSheet(false)}>
                <AntDesign name="close" size={24} color="#979e9eff" />
              </TouchableOpacity>

            </View>
            <ScrollView
              style={{ flex: 1 }}
              // contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
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
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </CustomBottomSheet>

        <CustomBottomSheet
          visible={addmedicalReportBottomSheet}
          onClose={() => setAddmedicalReportBottomSheet(false)}
          showHandle={false}
          height="65%"
        >
          <View style={{ flex: 1, backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
              <Text style={styles.bottomSheetHeaderText}>إضافة تقرير طبي</Text>
              <TouchableOpacity onPress={() => {
                setAddmedicalReportBottomSheet(false);
                clearMedicalReportForm();
              }}>
                <AntDesign name="close" size={24} color="#979e9eff" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <View style={styles.formContainer}>
                      {/* File Type */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>نوع الملف</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <Dropdown
                          data={[
                            { label: 'الاشعة', value: '1' },
                            { label: 'التحاليل المخبرية', value: '2' },
                            { label: 'ملخص التفريغ', value: '7' },
                            { label: 'أحرون', value: '8' }
                          ]}
                          value={medicalReportType}
                          onChange={(value) => {
                            setMedicalReportType(value.toString());
                            if (medicalReportTypeError) setMedicalReportTypeError('');
                          }}
                          placeholder="اختر نوع الملف"
                          containerStyle={[styles.dropdownContainer, medicalReportTypeError && styles.inputError]}
                        />
                        {medicalReportTypeError && <Text style={styles.errorText}>{medicalReportTypeError}</Text>}
                      </View>

                      {/* File Name */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>اسم الملف</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <TextInput
                          style={[styles.textInput, medicalReportFileNameError && styles.inputError]}
                          placeholder="ضع اسم الملف"
                          placeholderTextColor="#999"
                          textAlign="right"
                          value={medicalReportFileName}
                          onChangeText={(text) => {
                            setMedicalReportFileName(text);
                            if (medicalReportFileNameError) setMedicalReportFileNameError('');
                          }}
                        />
                        {medicalReportFileNameError && <Text style={styles.errorText}>{medicalReportFileNameError}</Text>}
                      </View>

                      {/* Add File */}
                      <View style={styles.inputGroup}>
                        <View style={styles.questionRow}>
                          <Text style={styles.questionText}>اضافة الملف</Text>
                          <Text style={styles.requiredAsterisk}> *</Text>
                        </View>
                        <View style={[styles.fileUploadContainer, medicalReportFileError && styles.inputError]}>
                          <Text style={styles.noFileChosenText}>
                            {medicalReportFile ? getFileName(medicalReportFile) : 'No file chosen'}
                          </Text>
                          <TouchableOpacity
                            style={styles.chooseFileButton}
                            onPress={pickMedicalReportFile}
                          >
                            <Text style={styles.chooseFileButtonText}>Choose file</Text>
                          </TouchableOpacity>

                        </View>
                        {medicalReportFileError && <Text style={styles.errorText}>{medicalReportFileError}</Text>}
                      </View>

                      {/* Submit Button */}
                      <View style={styles.formButtonContainer}>
                        <TouchableOpacity style={styles.addButton} onPress={addMedicalReport}>
                          <Text style={styles.addButtonText}>اضافة</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </CustomBottomSheet>

        <CustomBottomSheet
          visible={medicalReportListBottomSheet}
          onClose={() => setMedicalReportListBottomSheet(false)}
          showHandle={false}
          height="65%"
        >
          <View style={{ backgroundColor: '#eff5f5', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <View style={{ height: 50, backgroundColor: "#e4f1ef", borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
              <Text style={styles.bottomSheetHeaderText}>إضافة تقرير طبي</Text>
              <TouchableOpacity onPress={() => {
                setMedicalReportListBottomSheet(false);
              }}>
                <AntDesign name="close" size={24} color="#979e9eff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: '#F2F3F7', paddingHorizontal: 16, paddingVertical: 16 }}>
            <FlatList
              data={medicalReportList}
              renderItem={renderMedicalItem}
              ListEmptyComponent={() => (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.noFileChosenText}>لا يوجد تقارير طبية</Text>
                </View>
              )}
            />
          </View>
          <TouchableOpacity onPress={() => handleAddPress()} style={{ height: 40, width: '96%', backgroundColor: '#23a2a4', borderRadius: 10, justifyContent: 'center', alignItems: 'center',  marginBottom: 16, alignSelf: 'center' }}>
            <Text style={[globalTextStyles.bodyMedium, { color: '#fff' }]}>{'إضافة ملف جديد'}</Text>
          </TouchableOpacity>
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

      <CustomBottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        height="90%"
        showHandle={false}
      >
        <View style={{ flex: 1, backgroundColor: '#eff5f5',borderTopLeftRadius: 10,borderTopRightRadius: 10 }}>
          {/* Header */}
          <View style={{ height: 50, backgroundColor: "#e4f1ef", justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',borderTopLeftRadius: 10,borderTopRightRadius: 10, paddingHorizontal: 16 }}>
            <Text style={[globalTextStyles.bodyLarge, {fontSize:16, color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }]}>
              {visitHistoryData?.data?.HospitalInfo?.[0]?.CatCategoryId === 42 ? 'سجل الجلسة' : 'سجل الزيارة'}
            </Text>
            <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)}>
              <AntDesign name="close" size={24} color="#979e9eff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{flex:1,paddingHorizontal:16}}>
            {/* Patient Name */}
            {/* <View style={{ paddingVertical: 10, alignItems: 'flex-start' }}>
              <Text style={[globalTextStyles.h3, { color: '#000', fontFamily: CAIRO_FONT_FAMILY.bold }]}>
                {visitHistoryData?.patientName || 'مريض'}
              </Text>
            </View> */}

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
                <Text style={styles.downloadButtonText}>تحميل السجل PDF</Text>
              </TouchableOpacity>
            </View>
            </View>
          </ScrollView>
        </View>
      </CustomBottomSheet>

      <FullScreenLoader visible={isLoading} />

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
    height: Platform.OS === 'ios' ? 20 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? -10 : -14,
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
  bottomSheetHeaderText: {
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#36454F',

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
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 15,
  },
  questionText: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.bold,
    marginBottom: 8,
  },
  textInput: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  multilineTextInput: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#179c8e',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  downloadButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#23a2a4',
  },
  downloadButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#23a2a4',
    fontFamily: CAIRO_FONT_FAMILY.regular,
  },
  formButtonContainer: {
    marginTop: 20,
    gap: 15,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#FF0000',
    fontSize: 16,
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    marginTop: 4,
    marginLeft: 4,
  },
  fileSelectionButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  fileSelectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fileSelectionText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#666',
  },
  fileUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 44,
  },
  chooseFileButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  chooseFileButtonText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#333',
  },
  noFileChosenText: {
    fontSize: 14,
    fontFamily: CAIRO_FONT_FAMILY.regular,
    color: '#999',
    flex: 1,
  },
  addButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#179c8e',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#fff',
    fontFamily: CAIRO_FONT_FAMILY.bold,
  },


  sectionContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    // borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#32A3A4',
    alignItems: 'flex-start',
    padding: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
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
});

export default OrderDetailScreen; 