import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, PermissionsAndroid, Platform } from 'react-native';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import ClockIcon from '../../assets/icons/ClockIcon';
import SettingIconSelected from '../../assets/icons/SettingIconSelected';
import { useTranslation } from 'react-i18next';
import CommonRadioButton from '../../components/common/CommonRadioButton';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import { countries } from '../../utils/countryData';
import { addCardItem, setApiResponse, setSelectedUniqueId } from '../../shared/redux/reducers/bookingReducer';
import { bookingService } from '../../services/api/BookingService';
import { convert24HourToArabicTime, generatePayloadforOrderMainBeforePayment, generatePayloadforUpdateOrderMainBeforePayment, generateUniqueId } from '../../shared/services/service';
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
import { CAIRO_FONT_FAMILY, globalTextStyles } from '../../styles/globalStyles';
import { convertUTCToLocalDateTime } from '../../utils/timeUtils';
import FullScreenLoader from '../../components/FullScreenLoader';
import { ROUTES } from '../../shared/utils/routes';
import { useNavigation } from '@react-navigation/native';
import CustomPhoneInput, { COUNTRIES } from '../../components/common/CustomPhoneInput';
import Dropdown from "../../components/common/Dropdown";
import { profileService } from '../../services/api/ProfileService';
import MenuItem from 'screens/meeting/Components/MenuItem';

const beneficiaries = [
  { label: 'مستفيد جديد', value: 'new' },
  { label: 'مستفيد سابق', value: 'former' },
];

const nationalities = [
  { label: 'مواطن (معفى من الضريبة)', value: 'citizen' },
  { label: 'مقيم', value: 'resident' },
];

const ReviewOrder = ({ onPressNext, onPressBack }: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
 
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selected, setSelected] = useState('myself');
  const [fullNumber, setFullNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);
  // const [selectedCountry, setSelectedCountry] = useState<any | undefined>(countries.find(c => c.code === 'sa'));
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
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>();
  const [nationality, setNationality] = useState('citizen');
  const [idNumber, setIdNumber] = useState('');
  const [beneficiary, setBeneficiary] = useState('new');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [idNumberError, setIdNumberError] = useState(false);
  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [selectedBeneficiaryItem, setSelectedBeneficiaryItem] = useState<any>(null);
  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const apiResponse = useSelector((state: any) => state.root.booking.apiResponse);
  const [showGroupedArray, setShowGroupedArray] = useState([]);
  const [relationshipValue, setRelationshipValue] = useState('');
  const [relationshipError, setRelationshipError] = useState(false);
  const [addedBeneficiary, setAddedBeneficiary] = useState<any>(null);
  const [pendingUpdate, setPendingUpdate] = useState<{uniqueId: string, value: string} | null>(null);
  const [needAPICall, setNeedAPICall] = useState(false);
  // const [relationship, setRelationship] = useState([]);
  const Relation = [
    { label: 'اختر من فضلك', value: '' },
    { label: 'أب', value: '1' },
    { label: 'الأم', value: '2' },
    { label: 'ابن', value: '3' },
    { label: 'زوجة', value: '4' },
    { label: 'بنت', value: '5' },
    { label: 'صديق', value: '6' },
  ];
  const selectedDoctor: any = showGroupedArray[selectedIndex];
  const dispatch = useDispatch();

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
      const filteredList = response?.RefferalUserList.filter((item: any) => item.UserloginInfoId != user?.Id);
      const modifiedList: any = [
        { label: 'يرجى التحديد', value: '0' },
        ...filteredList.map((item: any) => ({ label: item.FullnameSlang, value: item.UserProfileinfoId, item: item })),
      ]
      setBeneficiariesList(modifiedList);
      if(addedBeneficiary) {
        const addedUser = modifiedList.find((item: any) => item.value == addedBeneficiary);
        if(needAPICall){
          setNeedAPICall(false);
          updatePatientInfoInSelectedDoctor(addedUser)
        }
        if(addedUser) {
          setSelected("other")
          setBeneficiary('former')
          setSelectedBeneficiary(addedUser.value);
          setSelectedBeneficiaryItem(addedUser.item);
        }
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (addedBeneficiary) {
      getBeneficiaries();
    }
  }, [addedBeneficiary]);

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
      setAudioDuration(duration);

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
    const getUnPaidUserOrders = async () => {
      try {
        setIsLoading(true);
        const response = await bookingService.getUnPaidUserOrders({ UserLoginInfoId: user.Id });

        if (response.Cart && response.Cart.length > 0) {
          // Convert API response to cardItems format
          const convertedCardItems = response.Cart;

          // Check for existing items and replace duplicates instead of adding
          setShowGroupedArray([]);
          const existingCardItems: any[] = [];
          const updatedCardItems = [...existingCardItems];

          convertedCardItems.forEach((newItem: any) => {
            // Find if item already exists by OrderDetailId and OrderId
            const existingIndex = updatedCardItems.findIndex((existingItem: any) =>
              existingItem.OrderDetailId === newItem.OrderDetailId &&
              existingItem.OrderId === newItem.OrderId
            );

            if (existingIndex !== -1) {
              const startTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingTime);
              const endTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingEndTime);
              newItem.SchedulingDate = startTime.localDate;
              newItem.SchedulingTime = startTime.localTime;
              newItem.SchedulingEndTime = endTime.localTime;
              // Replace existing item with new one
              updatedCardItems[existingIndex] = newItem;
            } else {
              // Add new item if it doesn't exist
              const startTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingTime);
              const endTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingEndTime);
              newItem.SchedulingDate = startTime.localDate;
              newItem.SchedulingTime = startTime.localTime;
              newItem.SchedulingEndTime = endTime.localTime;

              if(newItem.PatientUserProfileInfoId != "0") {
                const newItemObject = {
                  ...newItem,
                  "ItemUniqueId": newItem.ItemUniqueId ? newItem.ItemUniqueId : generateUniqueId()
                }
                updatedCardItems.push(newItemObject);
              }else{
                const newItemObject = {
                  ...newItem,
                  "ItemUniqueId": newItem.ItemUniqueId ? newItem.ItemUniqueId : generateUniqueId(),
                  PatientUserProfileInfoId: user.UserProfileInfoId,
                  TextDescription: "",
                }
                updatedCardItems.push(newItemObject);
              }

              
            }
          });

          // Dispatch the updated array
          const groupedArray: any = groupArrayByUniqueIdAsArray(updatedCardItems);
          setShowGroupedArray(groupedArray);

          dispatch(addCardItem(updatedCardItems));
        } else {
          dispatch(addCardItem([]));
          navigation.navigate(ROUTES.AppNavigator, {
            screen: ROUTES.HomeStack,
            params: {
              screen: ROUTES.AppointmentListScreen,
            }
          });
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    getUnPaidUserOrders();
  }, [user]);

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

    const imagePath = selectedItem.ServiceProviderImagePath ? `${MediaBaseURL}${selectedItem.ServiceProviderImagePath}` : `${MediaBaseURL}${selectedItem.LogoImagePath}`;
    const name = selectedItem.ServiceProviderFullnameSlang ? selectedItem.ServiceProviderFullnameSlang : selectedItem.orgTitleSlang;


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

  const updatePatientInfoInSelectedDoctor = (selectedItem: any) => {
    if(selectedItem.value == "0") {
      return;
    }
    const uniqueId = selectedDoctor?.items[0].ItemUniqueId;
    const updatedCardArray = [...CardArray];
    const index = updatedCardArray.findIndex((item: any) => item.ItemUniqueId == uniqueId);
    if(index != -1) {
      updatedCardArray[index] = {
        ...updatedCardArray[index],
        PatientUserProfileInfoId: selectedItem.value,
        CatRelationshipId: selectedItem.item.CatRelationshipId,
      };
      // Set pending update before dispatching
      setPendingUpdate({
        uniqueId: uniqueId,
        value: selectedItem.value
      });
      dispatch(addCardItem(updatedCardArray));
    }
  }

  // Effect to monitor Redux updates
  useEffect(() => {
    if (pendingUpdate) {
      // Check if the update has been applied to Redux state
      const updatedItem = CardArray.find((item: any) => item.ItemUniqueId === pendingUpdate.uniqueId);
      
      if (updatedItem && updatedItem.PatientUserProfileInfoId === pendingUpdate.value) {
        // Redux state has been updated
        console.log('Redux updated successfully:', CardArray);
        updatePatientInfoInOrder();
        
        // Clear the pending update
        setPendingUpdate(null);
      }
    }
  }, [CardArray, pendingUpdate]);

  const updatePatientInfoInOrder = async () => {
    const payload = {
      "OrderId": CardArray[0].OrderID,
      "CatPlatformId": 1,
      "OrderDetail": generatePayloadforUpdateOrderMainBeforePayment(CardArray)
    }

    await bookingService.updateOrderMainBeforePayment(payload);
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
      onPressNext();
    } else {
      Alert.alert(response.ResponseStatus.MESSAGE)
    }
  }

  const handleNext = () => {
    if (selected == "other") {
      if (selectedBeneficiary == "new") {
        Alert.alert("لا يمكنك المتابعة دون تعيين المريض");
        return;
      }
    }
    createOrderMainBeforePayment();
  };

  const handleBack = () => {
    const lastItemSelected = CardArray[CardArray.length - 1];
    dispatch(setSelectedUniqueId(lastItemSelected.ItemUniqueId));
    onPressBack();
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
  };
  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
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

  useEffect(() => {
    const phoneInfo = extractPhoneInfo(user?.CellNumber || '');
    const getCountry = COUNTRIES.find(c => c.code === phoneInfo.countryCode);
    setSelectedCountry(getCountry);
    setPhoneNumber(phoneInfo.phoneNumber);
  }, [user]);

  // Helper to format time
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSaveBeneficiary = async () => {
    if(beneficiaryName == "") {
      setNameError(true);
      return;
    }
    if(relationshipValue == "") {
      setRelationshipError(true);
      return;
    }
    if(nationality == "citizen") {
      if(idNumber == "") {
        setIdNumberError(true);
        return;
      }
    }

    
    const Payload = {
      "FullNamePlang": beneficiaryName,
      "FullNameSlang": beneficiaryName,
      "CatRelationshipId": relationshipValue,
      "RefferalUserloginInfoId": user.Id,
      "CatInsuranceCompanyId": null,
      "Gender": null,
      "Age": null,
      "CatNationalityId": nationality == 'citizen' ? 213 : 187,
      "IDNumber": nationality == 'citizen' ? idNumber : '',
    }
    console.log('check passed', Payload);
    const response = await bookingService.addBeneficiary(Payload)

    if(response.StatusCode.STATUSCODE == 3008) {
      const addedUser = response?.Userinfo[0]
      setNeedAPICall(true);
      setAddedBeneficiary(addedUser.Id)
    }
  }

  useEffect(() => {
    if(selectedDoctor) {
      const mySelfOrOther = selectedDoctor.items[0].PatientUserProfileInfoId == user.UserProfileInfoId ? 'myself' : 'other';
      setSelected(mySelfOrOther);
      if(mySelfOrOther == 'other') {
        setBeneficiary('former')
        setSelectedBeneficiary(selectedDoctor.items[0].PatientUserProfileInfoId)
        setSelectedBeneficiaryItem(beneficiariesList.find((item: any) => item.value == selectedDoctor.items[0].PatientUserProfileInfoId))
      }
      
    }
  }, [selectedDoctor]);

  return (
    <View style={styles.container}>
      <View style={{ height: 120, width: "100%", alignItems: "flex-start", backgroundColor: "#e4f1ef" }}>
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

      {selectedDoctor?.uniqueId && <ScrollView style={{ flex: 1, marginBottom: 60 }}>
        {/* Details card for selected doctor */}
        {
          selectedDoctor?.items?.map((item: any, index: number) => {
            let displayDate = '';
            let displayTime = '';

            if (item.SchedulingDate && item.SchedulingTime) {
              displayDate = moment(item.SchedulingDate).locale('en').format('DD/MM/YYYY');
              displayTime = convert24HourToArabicTime(item.SchedulingTime);
            }

            return (
              <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsHeaderText}>الخدمات المختارة (1)</Text>
                  <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>✎</Text>
                  </TouchableOpacity>
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
                      <Text style={styles.sessionInfoLabel}>تاريخ الجلسة</Text>
                    </View>
                    <Text style={styles.sessionInfoValue}>{displayDate}</Text>
                  </View>
                  <View style={styles.sessionInfoDetailItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <ClockIcon width={18} height={18} />
                      <Text style={styles.sessionInfoLabel}>توقيت الجلسة</Text>
                    </View>
                    <Text style={styles.sessionInfoValue}>{displayTime}</Text>
                  </View>
                  <View style={styles.sessionInfoDetailItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <SettingIconSelected width={18} height={18} />
                      <Text style={styles.sessionInfoLabel}>المدة</Text>
                    </View>
                    <Text style={styles.sessionInfoValue}>{calculateDuration(item?.SchedulingTime, item?.SchedulingEndTime)}</Text>
                  </View>
                </View>
              </View>
            )
          })
        }

        <View style={{ width: "100%", backgroundColor: "#e4f1ef", marginVertical: 16, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: "flex-start" }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#333' }]}>المرضى المراد حجز الجلسة لهم</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
          <CommonRadioButton
            selected={selected === 'myself'}
            onPress={() => setSelected('myself')}
            label="نفسي"
            style={{ width: "48%", }}
          />
          <CommonRadioButton
            selected={selected === 'other'}
            onPress={() => setSelected('other')}
            label="للغير"
            style={{ width: "48%" }}
          />
        </View>
        {selected === 'other' && (
          <View style={{ marginTop: 10, paddingTop: 16, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10, padding: 10, backgroundColor: "#fff" }}>
            {/* Beneficiary */}
            <View style={styles.fieldGroup}>
              <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                {beneficiaries.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.radioContainer}
                    onPress={() => setBeneficiary(item.value)}
                  >
                    <View style={[styles.radioOuter, beneficiary === item.value && styles.radioOuterSelected]}>
                      {beneficiary === item.value && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {beneficiary == "former" ? <View>
              <Dropdown
                data={beneficiariesList}
                containerStyle={{ height: 50 }}
                dropdownStyle={[{ height: 50 }, relationshipError && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]}
                value={selectedBeneficiary}
                // disabled={relationshipValue === ''}
                onChange={(value: string | number) => {
                  setSelectedBeneficiary(value.toString());
                  const selectedItem = beneficiariesList.find((item: any) => item.value == value);
                  setSelectedBeneficiaryItem(selectedItem);
                  updatePatientInfoInSelectedDoctor(selectedItem)
                }}
                placeholder=""
              />
            </View> :
              <View>
                <View style={styles.inputGroup}>
                  <View style={styles.questionRow}>
                    <Text style={styles.questionText}>{'اسم المستفيد '}</Text>
                    <Text style={styles.requiredAsterisk}> *</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, nameError && styles.inputError]}
                    placeholder="ضع الاسم الثلاثى"
                    placeholderTextColor="#999"
                    textAlign="right"
                    value={beneficiaryName}
                    onChangeText={(text) => {
                      setBeneficiaryName(text);
                      if (nameError) setNameError(false);
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.questionRow}>
                    <Text style={styles.questionText}>{'صلة القرابة '}</Text>
                    <Text style={styles.requiredAsterisk}> *</Text>
                  </View>
                  <Dropdown
                    data={Relation}
                    containerStyle={{ height: 50 }}
                    dropdownStyle={[{ height: 50 }, relationshipError && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]}
                    value={relationshipValue}
                    // disabled={relationshipValue === ''}
                    onChange={(value: string | number) => {
                      setRelationshipValue(value.toString());
                      if(relationshipError) setRelationshipError(false);
                    }}
                    placeholder=""
                  />
                </View>

                {/* Nationality */}
                <View style={styles.fieldGroup}>
                  <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                    {nationalities.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={styles.radioContainer}
                        onPress={() => setNationality(item.value)}
                      >
                        <View style={[styles.radioOuter, nationality === item.value && styles.radioOuterSelected]}>
                          {nationality === item.value && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioLabel}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {/* ID Number */}
                {nationality === 'citizen' && <View style={[styles.fieldGroup]}>
                  <Text style={styles.label}>رقم الهوية</Text>
                  <TextInput style={[styles.input, idNumberError && { borderColor: 'red', borderWidth: 1, borderRadius: 8 }]} value={idNumber} onChangeText={(text) => {
                    setIdNumber(text);
                    if(idNumberError) setIdNumberError(false);
                  }} placeholder="رقم الهوية" keyboardType="numeric" />
                </View>}
                <TouchableOpacity onPress={handleSaveBeneficiary} style={{ width: "100%", backgroundColor: "#23a2a4", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>يحفظ</Text>
                </TouchableOpacity>
              </View>}


          </View>
        )}
        <View style={{ width: "100%", alignItems: "flex-start" }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#333', textAlign: 'center', paddingVertical: 16 }]}>اسمك</Text>
          <TextInput
            style={{ width: "100%", color: "#000", height: 50, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 10, textAlign: "right" }}
            placeholder="اسمك"
            value={user?.FullnameSlang}
            editable={false}
          />
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#333', textAlign: 'center', paddingVertical: 16 }]}>رقم الجوال</Text>
          <CustomPhoneInput
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            onCountryChange={handleCountryChange}
            placeholder="Enter phone number"
            error={false}
            disabled={true}
            initialCountry={selectedCountry}
          />
        </View>

        <View style={{ width: "100%", backgroundColor: "#e4f1ef", marginVertical: 16, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: "flex-start" }}>
          <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#333' }]}>وصف الشكوى المرضية (إختياري)</Text>
        </View>
        <View style={{ width: "100%", alignItems: "flex-start", marginBottom: 24 }}>
          <TextInput
            style={{
              width: "100%",
              minHeight: 80,
              borderWidth: 1,
              borderColor: "#e0e0e0",
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              textAlign: "right",
              fontSize: 15,
              backgroundColor: "#fff"
            }}
            placeholder="الوصف النصي"
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#333', textAlign: 'left', paddingVertical: 16 }]}>
          صف شكواك بالتسجيل الصوتي (إختياري)
        </Text>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f5f6f7',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginVertical: 12,
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={isPlayingAudio ? stopAudio : playUploadedAudio}
            style={{ marginRight: 12 }}
            accessibilityLabel={isPlayingAudio ? 'Pause' : 'Play'}
            disabled={uploadedFileUrl == null || uploadedFileUrl == undefined}
          >
            <Icon
              name={isPlayingAudio ? 'pause-circle-filled' : 'play-circle-filled'}
              size={32}
              color={'#b0b3b8'}
            />
          </TouchableOpacity>

          {/* Time and Progress */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 15, fontVariant: ['tabular-nums'], minWidth: 60 }}>
              {formatTime(audioCurrentTime)} / {formatTime(audioDuration)}
            </Text>
            {/* Progress Bar */}
            <View style={{ flex: 1, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, marginHorizontal: 10 }}>
              <View
                style={{
                  width: `${audioProgress}%`,
                  height: 4,
                  backgroundColor: '#b0b3b8',
                  borderRadius: 2,
                }}
              />
            </View>
          </View>

          {/* Volume Icon */}
          <Icon name="volume-up" size={22} color="#b0b3b8" style={{ marginHorizontal: 10 }} />

          {/* Menu Icon */}
          {/* <TouchableOpacity style={{ padding: 4 }}>
            <Icon name="more-vert" size={22} color="#b0b3b8" />
          </TouchableOpacity> */}
        </View>

        <View style={{ width: "100%", alignItems: "flex-end" }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isRecording ? "#ff6b6b" : "#e4f1ef",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 18,
              marginTop: 4
            }}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isUploading}
          >
            <Text style={{ fontSize: 18, color: isRecording ? "#fff" : "#23a2a4", marginLeft: 6 }}>
              {isRecording ? "⏹️" : "🎤"}
            </Text>
            <Text style={{
              color: isRecording ? "#fff" : "#23a2a4",
              fontWeight: "bold",
              fontSize: 16
            }}>
              {isRecording ? `إيقاف التسجيل (${formatRecordingTime(recordingTime)})` : "بدء التسجيل"}
            </Text>
          </TouchableOpacity>

          {audioFile && !uploadedFileUrl && !isUploading && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f0f8f0",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 18,
              marginTop: 8
            }}>
              <Text style={{ fontSize: 16, color: "#4CAF50", marginLeft: 6 }}>✅</Text>
              <Text style={{ color: "#4CAF50", fontWeight: "bold", fontSize: 14 }}>
                تم حفظ التسجيل بنجاح
              </Text>
            </View>
          )}

          {isUploading && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff3cd",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 18,
              marginTop: 8
            }}>
              <Text style={{ fontSize: 16, color: "#856404", marginLeft: 6 }}>📤</Text>
              <Text style={{ color: "#856404", fontWeight: "bold", fontSize: 14 }}>
                جاري رفع الملف... {uploadProgress}%
              </Text>
            </View>
          )}
        </View>
      </ScrollView>}


      {/* Buttons */}
      <View style={styles.BottomContainer}>
        {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>

      <FullScreenLoader visible={isLoading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'left',
  },
  serviceName: {
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
  },
  separator: {
    width: 8,
  },
  detailsCard: {
    backgroundColor: '#F6FAF9',
    borderRadius: 12,
    padding: 16,
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
    paddingHorizontal: 10,
  },
  detailsHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 16,
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedServiceText: {
    fontSize: 15,
    color: '#23a2a4',
    fontWeight: 'bold',
  },
  sessionInfoTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  sessionInfoDetailsContainer: {
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  sessionInfoDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfoLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
    marginLeft: 2,
  },
  sessionInfoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
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
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: '#179c8e',
  },
  backButtonText: {
    color: '#179c8e',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 20,
    color: '#23a2a4',
    fontWeight: 'bold',
  },
  arrowIndicatorSimple: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.medium,
    marginBottom: 4,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 50,
    fontSize: 15,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.regular,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginLeft: 0,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#23a2a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
  },
  radioOuterSelected: {
    borderColor: '#23a2a4',
    backgroundColor: '#e4f1ef',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#23a2a4',
  },
  radioLabel: {
    fontSize: 14,
    color: '#222',
    fontFamily: CAIRO_FONT_FAMILY.medium,
  },
  inputGroup: {
    marginBottom: 15,
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
  questionText: {
    ...globalTextStyles.bodyMedium,
    color: '#333',
    fontFamily: CAIRO_FONT_FAMILY.medium,
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
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
});

export default ReviewOrder; 