// ChatMessageRender.js
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useSelector} from 'react-redux';
import MessageSentIcon from '../../assets/icons/MessageSent';
import MessageDeliveredIcon from '../../assets/icons/MessageDelivered';
import MessageSeenIcon from '../../assets/icons/MessageSeen';
import DocumentIcon from '../../assets/icons/DocumentIcon';
import DocumentIconBlack from '../../assets/icons/DocumentIconBlack';
import RNFS from 'react-native-fs';
import {Alert} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import DownloadIcon from '../../assets/icons/DownloadIcon';
import DownloadIconBlack from '../../assets/icons/DownloadIconBlack';
import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSourceAndroidType, AVEncoderAudioQualityIOSType, AVEncodingOption } from 'react-native-audio-recorder-player';
import VoiceNoteIcon from '../../assets/icons/VoiceNoteIcon';
import VoiceNoteIconBlack from '../../assets/icons/VoiceNoteIconBlack';
import {MediaBaseURL} from '../../shared/utils/constants';
import { globalTextStyles } from '../../styles/globalStyles';

// Conditionally import TrackPlayerService only for Android
const TrackPlayerService = Platform.OS === 'android'
  ? require('../../services/TrackPlayerService').TrackPlayerService
  : {
    // Mock implementation for iOS
    setupPlayer: async () => { },
    stop: async () => { },
    play: async () => { },
    addTrack: async () => { },
    getDuration: async () => 0,
    getPosition: async () => 0,
  };

interface Message {
  SenderId: string;
  Text: string;
  FilePath: string;
  Type: string;
  DateTime: string;
  status: string;
}

const ChatMessageRender = ({item}: {item: Message}) => {
  const {user} = useSelector((state: any) => state.root.user);
  const isOwnMessage = item.SenderId == user.Id;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const audioRecorderPlayer = useRef<AudioRecorderPlayer>(new AudioRecorderPlayer());
  const progressIntervalRef = useRef<any>(null);
  const audioProgressRef = useRef(0);
  const audioCurrentTimeRef = useRef(0);

  useEffect(() => {
    audioRecorderPlayer.current.setSubscriptionDuration(0.1);
    audioRecorderPlayer.current.addRecordBackListener((e) => {
    });

    return () => {
      // Cleanup on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (audioRecorderPlayer.current) {
        audioRecorderPlayer.current.removeRecordBackListener();
        try {
          audioRecorderPlayer.current.stopPlayer();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      if (Platform.OS === 'android') {
        try {
          TrackPlayerService.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const formattedTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  // Determine message status indicator
  const getStatusIndicator = () => {
    if (!isOwnMessage) return null;

    if (item.status == 'Seen') {
      return <MessageSeenIcon color="#59de6a" />;
    } else if (item.status == 'Delivered') {
      return <MessageDeliveredIcon color="#888" />;
    } else {
      return <MessageSentIcon color="#888" />;
    }
  };

  const downloadFileFromChat = (url: string) => {
    if (isDownloading) return;

    setIsDownloading(true);
    const fileURL = `${MediaBaseURL}/${url}`;
    let fileName = getFileNameFromUrl(fileURL) || 'file';
    if (Platform.OS === 'ios') {
      downloadFIleForIOS(fileURL, fileName);
    } else {
      downloadFile(fileURL, fileName);
    }
  };

  const getFileNameFromUrl = (url: string): string => {
    // Split the URL by '/'
    const parts = url.split('/');
    // Get the last part, which is the filename
    return parts.pop() || 'file';
  };

  const downloadFIleForIOS = (url: string, fileName: string) => {
    const {config, fs} = RNFetchBlob;
    const DocumentDir = fs.dirs.DocumentDir;
    const filePath = `${DocumentDir}/${fileName}`;

    config({
      fileCache: true,
      path: filePath,
    })
      .fetch('GET', url)
      .then(res => {
        Alert.alert(
          'File downloaded successfully',
          'The file is saved to your device.',
        );
        RNFetchBlob.ios.previewDocument(filePath);
        setIsDownloading(false);
      })
      .catch(error => {
        Alert.alert('File downloading error.');
        setIsDownloading(false);
      });
  };

  const downloadFile = (url: string, fileName: string) => {
    const {config, fs} = RNFetchBlob;
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
        Alert.alert('File downloaded successfully');
        setIsDownloading(false);
      })
      .catch(error => {
        Alert.alert('File downloading error.');
        setIsDownloading(false);
      });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getAudioUrl = (audioUrl: string): string => {
    const audioUrlValue = audioUrl.split('^')[0];
    if (audioUrlValue) {
      return audioUrlValue;
    }
    return '';
  };

  const getAudioDuration = (audioUrl: string): number => {
    const duration = audioUrl.split('^')[1];
    if (duration) {
      return parseInt(duration);
    }
    return 0;
  };

  const stopAudio = useCallback(async () => {
    if (isPlaying) {
      try {
        if (Platform.OS === 'ios') {
          await audioRecorderPlayer.current.stopPlayer();
          audioRecorderPlayer.current.removePlayBackListener();
        } else {
          await TrackPlayerService.stop();
        }

        // Clear progress interval if it exists
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        setIsPlaying(false);
        setAudioProgress(0);
        setCurrentTime(0);
        audioProgressRef.current = 0;
        audioCurrentTimeRef.current = 0;
        progressAnim.setValue(0);
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
  }, [isPlaying]);

  // Audio playback using react-native-track-player for Android
  const playAudioWithTrackPlayer = async (audioUrl: string) => {
    try {
      await TrackPlayerService.setupPlayer();

      await new Promise(resolve => setTimeout(() => resolve(undefined), 200));

      await TrackPlayerService.stop();

      await new Promise(resolve => setTimeout(() => resolve(undefined), 200));

      await TrackPlayerService.addTrack(audioUrl, 'Voice Note');

      await new Promise(resolve => setTimeout(() => resolve(undefined), 500));

      await TrackPlayerService.play();
      setIsPlaying(true);

      let updateCounter = 0;
      progressIntervalRef.current = setInterval(async () => {
        try {
          const position = await TrackPlayerService.getPosition();
          const currentDuration = await TrackPlayerService.getDuration();

          // Update refs immediately
          audioCurrentTimeRef.current = position;
          const progress = currentDuration > 0 ? (position / currentDuration) * 100 : 0;
          audioProgressRef.current = progress;

          // Update state only every 5 updates (every 500ms instead of 100ms)
          updateCounter++;
          if (updateCounter % 5 === 0) {
            setCurrentTime(position);
            setAudioProgress(progress);
            setDuration(currentDuration);
            progressAnim.setValue(progress / 100);
          }

          // Check if playback finished
          if (position >= currentDuration && currentDuration > 0) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            setIsPlaying(false);
            setAudioProgress(0);
            setCurrentTime(0);
            audioProgressRef.current = 0;
            audioCurrentTimeRef.current = 0;
            progressAnim.setValue(0);
          }
        } catch (error) {
          console.log('Error tracking progress:', error);
        }
      }, 100);

      return true;
    } catch (error) {
      console.log('TrackPlayer error:', error);
      throw error;
    }
  };

  const playVoiceNote = useCallback(async (url: string) => {
    if (isPlaying) {
      await stopAudio();
      return;
    }

    try {
      setAudioProgress(0);
      setCurrentTime(0);

      // Extract URL and duration from the format "url^duration"
      const cleanFileURL = getAudioUrl(url);
      const audioDuration = getAudioDuration(url);

      // Build full URL if needed
      const fullUrl = cleanFileURL.startsWith('http')
        ? cleanFileURL
        : `${MediaBaseURL}/${cleanFileURL}`;

      if (Platform.OS === 'ios') {
        try {
          const fileName = `audio_${Date.now()}.m4a`;
          const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

          const downloadResult = await RNFS.downloadFile({
            fromUrl: fullUrl,
            toFile: filePath,
            background: true,
          }).promise;

          if (downloadResult.statusCode === 200) {
            const fileExists = await RNFS.exists(filePath);
            if (!fileExists) {
              throw new Error('Downloaded file does not exist');
            }

            const fileStats = await RNFS.stat(filePath);
            if (fileStats.size < 1000) {
              throw new Error('Downloaded file is too small');
            }

            // Use the audio recorder player for iOS playback
            try {
              let updateCounter = 0;
              // Set up event listeners for iOS playback
              audioRecorderPlayer.current.addPlayBackListener((e) => {
                if (e.currentPosition >= e.duration) {
                  // Playback finished
                  setIsPlaying(false);
                  setAudioProgress(0);
                  setCurrentTime(0);
                  audioProgressRef.current = 0;
                  audioCurrentTimeRef.current = 0;
                  progressAnim.setValue(0);
                  audioRecorderPlayer.current.removePlayBackListener();
                } else {
                  // Update refs immediately
                  audioCurrentTimeRef.current = e.currentPosition / 1000;
                  audioProgressRef.current = (e.currentPosition / e.duration) * 100;

                  // Update state only every 5 updates (reduce re-renders)
                  updateCounter++;
                  if (updateCounter % 5 === 0) {
                    setCurrentTime(audioCurrentTimeRef.current);
                    setAudioProgress(audioProgressRef.current);
                    setDuration(e.duration / 1000);
                    progressAnim.setValue(audioProgressRef.current / 100);
                  }
                }
              });

              // Start playback using audioRecorderPlayer
              await audioRecorderPlayer.current.startPlayer(`file://${filePath}`);
              setIsPlaying(true);

              // Set duration if available from URL format
              if (audioDuration > 0) {
                setDuration(audioDuration);
              }

            } catch (playbackError) {
              console.log('iOS playback error:', playbackError);
              Alert.alert('Error', 'Failed to play voice note. Please try again.');
              setIsPlaying(false);
            }
          } else {
            throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
          }
        } catch (error) {
          console.log('iOS audio error:', error);
          Alert.alert('Error', 'Failed to download voice note. Please try again.');
          setIsPlaying(false);
        }
      } else {
        // Android implementation - use track player
        try {
          await playAudioWithTrackPlayer(fullUrl);
          // Set duration if available from URL format
          if (audioDuration > 0) {
            setDuration(audioDuration);
          }
        } catch (error) {
          console.log('Android playback error:', error);
          Alert.alert('Error', 'Failed to play voice note. Please try again.');
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.log('General playback error:', error);
      Alert.alert('Error', 'Failed to play voice note. Please try again.');
    }
  }, [isPlaying, stopAudio]);

  // Update progress animation when audioProgress changes
  useEffect(() => {
    progressAnim.setValue(audioProgress / 100);
  }, [audioProgress, progressAnim]);

  if (item.Type === 'FilePath' && item.FilePath) {
    return (
      <TouchableOpacity
        onPress={() => !isDownloading && downloadFileFromChat(item.FilePath)}
        disabled={isDownloading}
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isDownloading && styles.disabledMessage,
        ]}>
        <View style={styles.fileBox}>
          {isOwnMessage ? <DocumentIcon /> : <DocumentIconBlack />}
          <Text style={styles.fileName} numberOfLines={1}>
            {getFileNameFromUrl(item.FilePath)}
          </Text>
        </View>
        <View style={styles.messageFooter}>
          <View style={styles.downloadIconContainer}>
            {isDownloading ? (
              <ActivityIndicator
                size="small"
                color={isOwnMessage ? 'white' : 'black'}
              />
            ) : isOwnMessage ? (
              <DownloadIcon />
            ) : (
              <DownloadIconBlack />
            )}
          </View>
          <Text
            style={[
              styles.timestamp,
              isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
            ]}>
            {formattedTime(item.DateTime)}
          </Text>
          {getStatusIndicator()}
        </View>
      </TouchableOpacity>
    );
  }

  if (item.Type === 'VoiceNote' && item.FilePath) {
    return (
      <TouchableOpacity
        onPress={() => playVoiceNote(item.FilePath)}
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          styles.voiceNoteBubble,
        ]}>
        <View style={styles.voiceNoteContainer}>
          <Text
            style={[
              styles.voiceNoteDuration,
              isOwnMessage && styles.ownVoiceNoteDuration,
            ]}>
            {Platform.OS == 'ios' ? `${formatTime(currentTime)} / ${formatTime(duration)}` : `${formatTime(duration)} / ${formatTime(currentTime)}`}
          </Text>
          <View style={styles.voiceNoteControls}>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: isOwnMessage
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                    isOwnMessage && styles.ownProgressFill,
                  ]}
                />
              </View>
            </View>
            <View
              style={[
                styles.playButton,
                isPlaying && styles.playingButton,
                {
                  backgroundColor: isOwnMessage
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.1)',
                },
                isPlaying && {
                  backgroundColor: isOwnMessage
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.2)',
                },
              ]}>
              <View
                style={[
                  styles.playIcon,
                  isPlaying && styles.pauseIcon,
                  {
                    borderLeftColor: isOwnMessage ? 'white' : 'black',
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                  },
                  isPlaying && {
                    borderLeftColor: isOwnMessage ? 'white' : 'black',
                    borderRightColor: isOwnMessage ? 'white' : 'black',
                  },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
            ]}>
            {formattedTime(item.DateTime)}
          </Text>
          {getStatusIndicator()}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        // socketStatus?.isPending && styles.pendingMessage,
        // socketStatus?.isFailed && styles.failedMessage,
      ]}>
      <Text
        style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
        ]}>
        {item.Text}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
          ]}>
          {formattedTime(item.DateTime)}
        </Text>
        {getStatusIndicator()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerChat: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    ...globalTextStyles.bodyMedium,
    color: 'white',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    ...globalTextStyles.bodyMedium,
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#23a2a4',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    ...globalTextStyles.buttonMedium,
    color: 'white',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    ...globalTextStyles.bodyMedium,
    color: '#23a2a4',
  },
  chatTitle: {
    ...globalTextStyles.h4,
    color: 'white',
  },
  headerPlaceholder: {
    width: 50,
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#23a2a4',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  sendingMessage: {
    opacity: 0.7,
  },
  messageText: {
    ...globalTextStyles.bodyMedium,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'black',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    gap: 4,
    position: 'relative',
    paddingLeft: 30,
  },
  timestamp: {
    ...globalTextStyles.caption,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'black',
  },
  statusText: {
    ...globalTextStyles.caption,
    color: '#8a8a8a',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 20,
    color: 'white',
    backgroundColor: '#313131',
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#23a2a4',
  },
  sendButtonDisabled: {
    backgroundColor: '#313131',
  },
  sendButtonText: {
    ...globalTextStyles.buttonMedium,
    color: 'white',
  },
  statusFailed: {
    ...globalTextStyles.caption,
    color: '#FF4C4C', // red
    fontFamily: globalTextStyles.h5.fontFamily,
    marginTop: 4,
  },
  statusPending: {
    ...globalTextStyles.caption,
    color: '#FFA500', // orange
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusSeen: {
    ...globalTextStyles.caption,
    color: '#4CAF50', // green
    fontFamily: globalTextStyles.h5.fontFamily,
    marginTop: 4,
  },
  statusDelivered: {
    ...globalTextStyles.caption,
    color: '#2196F3', // blue
    marginTop: 4,
  },
  statusSent: {
    ...globalTextStyles.caption,
    color: '#9E9E9E', // grey
    marginTop: 4,
  },
  fileBox: {
    alignItems: 'center',
    padding: 10,
  },
  fileName: {
    ...globalTextStyles.bodySmall,
    color: 'black',
    marginTop: 8,
    marginBottom: 12,
  },
  downloadIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  disabledMessage: {
    opacity: 0.5,
  },
  voiceNoteBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '70%',
    maxWidth: 280,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceNoteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playingButton: {
    // backgroundColor is now handled inline
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 0,
    borderRightWidth: 16,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    marginLeft: 0,
    marginRight: 4,
  },
  pauseIcon: {
    width: 16,
    height: 24,
    borderWidth: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    marginLeft: 0,
    marginRight: 0,
  },
  progressContainer: {
    flex: 1,
    maxWidth: 200,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'black',
  },
  ownProgressFill: {
    backgroundColor: 'white',
  },
  voiceNoteDuration: {
    ...globalTextStyles.bodySmall,
    color: 'black',
    fontFamily: globalTextStyles.h5.fontFamily,
    marginRight: 12,
  },
  ownVoiceNoteDuration: {
    color: 'white',
  },
});

export default ChatMessageRender;
