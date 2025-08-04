import {useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  RTCView,
  switchAudioDevice,
  useMediaDevice,
} from '@videosdk.live/react-native-sdk';
import React, {useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  I18nManager,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import colors from '../../shared/utils/color';
import VideoOff from '../../assets/icons/VideoOff';
import VideoOn from '../../assets/icons/VideoOn';
import MicOff from '../../assets/icons/MicOff';
import MicOn from '../../assets/icons/MicOn';
import BackIcon from '../../assets/icons/BackIcon';
import CameraOffImage from '../../assets/icons/CameraOffImage';
import {ROUTES} from '../../shared/utils/routes';
import CameraIcon from '../../assets/icons/CameraIconLeft';
import CameraIconWithCircle from '../../assets/icons/CameraIconWithCircle';
import MicIcon from '../../assets/icons/MicIcon';
import MicIconWithCircle from '../../assets/icons/MicIconWithCircle';
import NetworkSignalIcon from '../../assets/icons/NetworkSignalIcon';
import MicIconOff from '../../assets/icons/MicIconOff';
import CameraIconOff from '../../assets/icons/CameraIconOff';
import useParticipantStat from '../meeting/Hooks/useParticipantStat';
import {useTranslation} from 'react-i18next';
import {changeLanguage} from '../../utils/language/i18nextConfig';
import {LangCode} from '../../utils/language/LanguageUtils';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import Svg, {Path} from 'react-native-svg';
import RightArrowIcon from '../../assets/icons/RightArrow';
import { getVideoSDKToken } from '../../services/api/MessagesAndCallService';

const width = 200;

const PreViewScreen = ({navigation, route}: any) => {
  const [tracks, setTrack] = useState('');
  const [micOn, setMicon] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [facingMode, setfacingMode] = useState('user');
  const [videoSDKToken, setVideoSDKToken] = useState('');
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const meetingTypes = [
    {key: 'ONE_TO_ONE', value: 'One to One Meeting'},
    {key: 'GROUP', value: 'Group Meeting'},
  ];

  const {t, i18n} = useTranslation();
  const displayName = route?.params?.Data?.Name;
  const meetingId = route?.params?.Data?.meetingId;
  const sessionStartTime = route?.params?.Data?.sessionStartTime;
  const sessionEndTime = route?.params?.Data?.sessionEndTime;

  const [recording, setRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    if (Platform.OS == 'android') {
      checkPermission();
    }

  }, []);

  const checkPermission = async () => {
    try {
      const status = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      if (status === RESULTS.GRANTED) {
        prepareRecording();
      } else {
        setErrorMessage('Microphone permission denied');
      }
    } catch (error) {
      console.error('Permission error: ', error);
    }
  };

  const prepareRecording = () => {
    // Initialize audio record settings
    
  };

  const calculateVolume = base64Data => {
    // Step 1: Decode base64 to binary buffer
    const binaryString = atob(base64Data); // Decode base64 string
    const len = binaryString.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      view[i] = binaryString.charCodeAt(i);
    }

    // Step 2: Create Int16Array from the buffer
    const pcm = new Int16Array(buffer);

    // Step 3: Calculate the volume
    const sumSquares = pcm.reduce((sum, value) => sum + value * value, 0);
    return Math.sqrt(sumSquares / pcm.length);
  };

  const getWavePath = () => {
    const amplitude = Math.min(Math.abs(volume), 100); // Limit max amplitude
    const frequency = 3; // Number of waves on the screen
    const pathHeight = 100; // Height of the wave
    let path = 'M0 ' + pathHeight / 2 + ' ';

    for (let i = 0; i < width; i++) {
      const y =
        pathHeight / 2 +
        amplitude * Math.sin((i / width) * frequency * Math.PI * 2);
      path += `L${i} ${y} `;
    }

    return path;
  };

  const getVideoSDKTokenFromAPI = async () => {
    const videoSDKToken = await getVideoSDKToken();
    setVideoSDKToken(videoSDKToken.Data.Token);
  };

  useEffect(() => {
    getVideoSDKTokenFromAPI();
  }, []);

  const [meetingType, setMeetingType] = useState(meetingTypes[0]);

  const {getAudioDeviceList} = useMediaDevice();

  const fetchAudioDevices = async () => {
    const devices = await getAudioDeviceList();
    return devices;
  };

  const handleDevicePress = async () => {
    const device = await fetchAudioDevices();
    // Handle the device selection logic here
    const id = device[1].deviceId;
    await switchAudioDevice(id);
  };

  const disposeVideoTrack = async () => {
    try {
      const currentTrack = tracks;
      if (currentTrack) {
        currentTrack.getTracks().forEach((track: any) => {
          track.enabled = false;
          track.stop();
        });
      }
      setTrack('');
    } catch (error) {
      console.error('Error disposing video track:', error);
    }
  };

  useEffect(() => {
    return () => {
      disposeVideoTrack();
    };
  }, []);

  const handleBackPress = async () => {
    await disposeVideoTrack();
    navigation.navigate(ROUTES.AppNavigator, {
      screen: ROUTES.HomeStack,
      params: {
        screen: ROUTES.AppointmentListScreen,
      }
    });
  };

  const getAudioTrack = async () => {
    try {
      //Returns a MediaStream object, containing the Audio Stream from the selected Mic Device.
      let customTrack = await createMicrophoneAudioTrack({
        encoderConfig: 'speech_standard',
        noiseConfig: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
    } catch (error) {}
  };

  const getTrack = async () => {
    getAudioTrack();

      const track = await createCameraVideoTrack({
        optimizationMode: 'motion',
        encoderConfig: 'h720p_w960p',
        facingMode: facingMode,
      });
      setTrack(track);
  };

  useEffect(() => {
    if(isFocused) {
      handleDevicePress();
      getTrack();
    }else{
      disposeVideoTrack();
    }
    
  }, [facingMode, isFocused]);

  const toggleCameraFacing = () => {
    try {
      disposeVideoTrack();
    } finally {
      setfacingMode(prevFacingMode =>
        prevFacingMode === 'environment' ? 'user' : 'environment',
      );
    }
  };

  const onJoinMeeting = () => {
    if (videoSDKToken) {
      const paramsVal = {
        name: displayName,
        token: videoSDKToken,
        meetingId: meetingId,
        micEnabled: micOn,
        webcamEnabled: videoOn,
        meetingType: meetingType.key,
        defaultCamera: facingMode === 'user' ? 'front' : 'back',
        sessionStartTime: sessionStartTime,
        sessionEndTime: sessionEndTime,
        Data: route?.params,
      };

      setMicon(true);
      setVideoOn(true);
      if(meetingId){
        navigation.navigate(ROUTES.Meeting, paramsVal);
      }else{
        Alert.alert('Meeting ID is required');
      }
    }
  };

  const handleLanguageToggle = () => {
    // Toggle between Arabic and English using the separate changeLanguage function
    const newLanguage = I18nManager.isRTL ? LangCode.en : LangCode.ar;
    changeLanguage(newLanguage);
  };


  // Add effect to check session expiration
  useEffect(() => {
    const checkSessionExpiration = () => {
      const now = new Date();
      const endTime = new Date(sessionEndTime);
      setIsSessionExpired(now > endTime);
    };

    // Check immediately
    checkSessionExpiration();

    // Set up interval to check every minute
    const interval = setInterval(checkSessionExpiration, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [sessionEndTime]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#E6ECEC'}}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              height: 60,
              width: '100%',
              backgroundColor: '#23a2a4',
              paddingHorizontal: 16,
              alignItems: 'center',
            }}>
            {I18nManager.isRTL ? (
              <TouchableOpacity
                onPress={handleBackPress}
                style={{flexDirection: 'row', paddingHorizontal: 8}}>
                <RightArrowIcon />
                <Text
                  style={{paddingLeft: 4, fontSize: 16, fontWeight: 'bold'}}>
                  خلف
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleBackPress} style={{flexDirection: 'row'}}>
                <BackIcon />
                <Text style={{paddingLeft: 8}}>Back</Text>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              height: 250,
              width: '90%',
              alignSelf: 'center',
              backgroundColor: 'gray',
              marginTop: 20,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: 'white',
            }}>
            {videoOn && tracks ? (
              <RTCView
                streamURL={tracks.toURL()}
                objectFit={'cover'}
                mirror={true}
                style={{
                  flex: 1,
                  borderRadius: 20,
                }}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f5fafa',
                }}>
                <CameraIcon height={50} width={50} />
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: '#CBCBCB',
              height: 50,
              marginTop: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '90%',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '90%',
              }}>
              <View
                style={{
                  width: '12%',
                  justifyContent: 'center',
                }}>
                <CameraIcon height={28} width={28} />
              </View>

              <Text
                style={
                  I18nManager.isRTL
                    ? {fontSize: 15, fontWeight: '500', color: 'black'}
                    : {
                        paddingLeft: 10,
                        fontSize: 15,
                        fontWeight: '500',
                        color: 'black',
                      }
                }>
                {t('video')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setVideoOn(!videoOn)}>
              {videoOn ? <CameraIconWithCircle /> : <CameraIconOff />}
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: '#CBCBCB',
              height: 50,
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '90%',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '90%',
              }}>
              <View
                style={{
                  width: '12%',
                  justifyContent: 'center',
                }}>
                <MicIcon />
              </View>

              <Text style={{fontSize: 15, fontWeight: '500', color: 'black'}}>
                {t('microphone')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setMicon(!micOn)}>
              {micOn ? (
                <MicIconWithCircle height={33} width={33} />
              ) : (
                <MicIconOff />
              )}
            </TouchableOpacity>
          </View>
          {/* <View
            style={{
              height: 60,
              width: '90%',
              alignSelf: 'center',
              backgroundColor: 'white',
              marginTop: 20,
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
            }}>
            <NetworkSignalIcon />
            <View style={{paddingLeft:10}}>
              <Text style={{fontSize: 12, fontWeight: '600', color: 'black'}}>
                Poor connection{' '}
              </Text>
              <Text style={{fontSize: 10, fontWeight: '400', color: 'black'}}>
                Try moving to get better signal
              </Text>
            </View>
          </View> */}
        </View>
        <TouchableOpacity
          onPress={onJoinMeeting}
          disabled={isSessionExpired}
          style={{
            height: 40,
            width: '90%',
            marginBottom: 30,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            alignSelf: 'center',
            backgroundColor: isSessionExpired ? '#CCCCCC' : '#32A3A4',
            opacity: isSessionExpired ? 0.7 : 1,
          }}>
          <Text style={{fontSize: 14, fontWeight: '400', color: 'white'}}>
            {t('join_now')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreViewScreen;
