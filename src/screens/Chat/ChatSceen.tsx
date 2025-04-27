// ChatScreen.js - Chat component with WebSocket integration

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  AppState,
  Keyboard,
  Dimensions,
} from 'react-native';
import useMutationHook from '../../Network/useMutationHook';
import {getMessagesList} from '../../Network/getMessagesList';
import {useSelector} from 'react-redux';
import ChatMessageRender from './ChatMessageRender';
import WebSocketService from '../../components/WebSocketService';

interface Message {
  Id: string;
  SenderId: string;
  Text: string;
  FilePath: string | null;
  Type: string;
  DateTime: string;
  status: string;
  isSent?: boolean;
  isPending?: boolean;
  isFailed?: boolean;
}

interface ScrollEvent {
  nativeEvent: {
    contentOffset: {
      y: number;
    };
  };
}

const ChatScreen = ({patientId, serviceProviderId, onBackPress}: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const {user} = useSelector((state: any) => state.root.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mongoSenderId, setMongoSenderId] = useState<string | null>(null);
  const [mongoReceiverId, setMongoReceiverId] = useState<string | null>(null);
  const [mongoConverstionId, setMongoConverstionId] = useState<string | null>(
    null,
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const firstVisibleMessageIndex = useRef<number | null>(null);
  const firstVisibleMessageOffset = useRef<number | null>(null);
  const lastMessageIndex = useRef<number | null>(null);
  const [lastLoadedMessagesCount, setLastLoadedMessagesCount] = useState(0);
  const previousMessagesLength = useRef(0);
  const flatListRef = useRef<FlatList<Message>>(null);
  const listContentOffsetY = useRef(0);
  const oldContentHeight = useRef(0);
  const socketService = useRef(WebSocketService.getInstance());
  const messagesEndRef = useRef(null);
  const screenHeight = useRef<number>(0);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  });

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      firstVisibleMessageIndex.current = viewableItems[0].index;
    }
  });

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);

      // Handle reconnection when app comes to foreground
      if (
        appState.match(/inactive|background/) &&
        nextAppState === 'active' &&
        user?.userinfo?.CommunicationKey
      ) {
        initializeSocket();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appState, user]);

  // Initialize socket connection
  const initializeSocket = async () => {
    console.log('user val', user);
    try {
      if (user?.communicationKey && user?.id) {
        await socketService.current.connect(
          1, // Presence value (1 for online)
          user?.communicationKey,
          user?.id,
        );
        setSocketConnected(true);

        // Set up socket message handler
        setupSocketListeners();
      }
    } catch (err) {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
    }
  };

  // Set up socket event listeners
  const setupSocketListeners = () => {
    // We need to extend the WebSocketService to handle these events
    // This adds functionality to the existing WebSocketService

    // First, get a reference to the actual WebSocket instance
    const socket = socketService.current.getSocket();

    if (socket) {
      // Override the onmessage handler to handle chat messages
      const originalOnMessage = socket.onmessage;

      socket.onmessage = async event => {
        // Still call the original handler if it exists
        if (originalOnMessage) {
          originalOnMessage(event);
        }

        const socketEvent = JSON.parse(event.data);

        if (socketEvent.Command === 76) {
          updateMessageStatus('Sent', 'Delivered');
        } else if (socketEvent.Command === 73) {
          updateMessageStatus('Delivered', 'Seen');
        } else if (socketEvent.Command === 56) {
          const parsedData = JSON.parse(socketEvent.Message);

          const messageType = parsedData.MessageType;

          if (messageType == 'Text') {
            const newMessageObj = {
              Id: Math.random().toString(36).substr(2, 9), // Temporary ID until server response
              SenderId: socketEvent.FromUser,
              Text: parsedData.Text,
              FilePath: null,
              Type: 'Text',
              DateTime: new Date().toISOString(),
              status: 'Seen',
            };

            setMessages(prevMessages => [...prevMessages, newMessageObj]);
            sendReadReceipt();
            console.log('flatListRef', flatListRef?.current);
            flatListRef?.current?.scrollToEnd({animated: true});
          }
        }
      };
    }
  };

  // Send read receipt when message is displayed
  const sendReadReceipt = () => {
    if (socketConnected) {
      const socketEvent = {
        ConnectionMode: 1,
        Command: 72,
        FromUser: {Id: user.id},
        Conversation: {
          ConversationId: mongoConverstionId,
          SenderId: mongoReceiverId,
          ReceiverId: mongoSenderId,
        },
        Message: JSON.stringify({
          ConversationId: mongoConverstionId,
          SenderId: mongoReceiverId,
          ReceiverId: mongoSenderId,
        }),
        timestamp: new Date().toISOString(),
      };

      socketService.current.sendMessage(socketEvent);
    }
  };

  // Update message status in state
  const updateMessageStatus = (findStatus, setStatusVal) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.status === findStatus ? {...msg, status: setStatusVal} : msg,
      ),
    );
  };

  // Initial setup - Connect to socket and fetch messages
  useEffect(() => {
    setLoading(true);

    // Initialize WebSocket connection
    initializeSocket();

    // Fetch previous messages
    fetchPreviousMessages(1).finally(() => {
      setLoading(false);
      // Scroll to bottom after initial messages are loaded
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({animated: false});
        }
      }, 100);
    });

    // Cleanup function for component unmount
    return () => {
      if (socketService.current.getSocket()) {
        socketService.current.getSocket().onmessage = null;
      }
    };
  }, []);

  useEffect(() => {
    // Get screen height when component mounts
    const getScreenHeight = () => {
      const windowHeight = Dimensions.get('window').height;
      screenHeight.current = windowHeight;
    };
    getScreenHeight();
  }, []);

  // Track scroll position
  const handleScroll = (event: ScrollEvent) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    listContentOffsetY.current = offsetY;

    // Only load more when very close to the top and not already loading
    if (offsetY < 20 && hasMoreMessages && !isLoadingMore && !isFetchingMore) {
      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set new timeout to prevent multiple calls
      scrollTimeout.current = setTimeout(() => {
        // Store the current messages length before loading more
        previousMessagesLength.current = messages.length;
        fetchPreviousMessages(pageNumber);
      }, 300);
    }
  };

  // Fetch previous messages
  const fetchPreviousMessages = async (page = 1) => {
    if (!hasMoreMessages && page !== 1) return;
    if (isFetchingMore || isLoadingMore) return;

    setIsLoadingMore(true);
    if (page > 1) setIsFetchingMore(true);

    try {
      const messagesResponse = await getMessagesList({
        PatientId: patientId,
        CareProviderId: serviceProviderId,
        PageNumber: page,
        PageSize: 20,
      });

      const data = messagesResponse?.Data || [];

      if (data.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      // Your existing ID setup code
      if (page === 1) {
        if (data[0]?.senderDetails?.userlogininfoId === user.id) {
          setMongoSenderId(data[0]?.senderId);
          setMongoReceiverId(data[0]?.receiverId);
          setMongoConverstionId(data[0]?.conversationId);
        } else {
          setMongoSenderId(data[0]?.receiverId);
          setMongoReceiverId(data[0]?.senderId);
          setMongoConverstionId(data[0]?.conversationId);
        }
      }

      let tempMessagesArray: Message[] = [];

      data.forEach((item: any) => {
        let message: Message = {
          Id: item._id,
          SenderId: item.senderDetails?.userlogininfoId,
          Text: item.content?.text,
          FilePath:
            item.content.type === 'FilePath' ||
            item.content.type === 'VoiceNote'
              ? item.content?.text
              : null,
          Type: item.content.type,
          DateTime: item.createdAt,
          status: item.readByRecipient?.status,
        };
        tempMessagesArray.push(message);
      });

      const reversedMessages = tempMessagesArray.reverse();

      if (page === 1) {
        setMessages(reversedMessages);
        sendReadReceipt();
      } else {
        // Add new messages to the beginning
        setMessages(prevMessages => [...reversedMessages, ...prevMessages]);
      }

      if (data.length < 20) {
        setHasMoreMessages(false);
      } else {
        setPageNumber(prev => prev + 1);
      }
    } catch (error) {
      console.error('messages list error', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      // Add a delay before resetting loading states
      setTimeout(() => {
        setIsLoadingMore(false);
        setIsFetchingMore(false);
      }, 100);
    }
  };

  const safeScrollToIndex = index => {
    try {
      if (flatListRef.current && index >= 0 && index < messages.length) {
        flatListRef.current.scrollToIndex({
          index,
          animated: false,
          viewOffset: 0,
        });
      }
    } catch (error) {
      console.log('Error during scrollToIndex:', error);
      // Fallback
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: 0,
          animated: false,
        });
      }
    }
  };

  // Handle maintaining scroll position when loading older messages
  const onContentSizeChange = (width: number, height: number) => {
    // When we've loaded more messages and need to maintain position
    if (isFetchingMore && previousMessagesLength.current > 0) {
      const newMessagesCount = messages.length - previousMessagesLength.current;

      if (newMessagesCount > 0) {
        // Use safeScrollToIndex instead of direct scrollToIndex
        safeScrollToIndex(newMessagesCount);
      }
    }
  };

  // Send a message through WebSocket
  const sendMessage = () => {
    if (messageText.trim() === '' || !socketConnected || !mongoConverstionId)
      return;

    // Create message data
    const messageData = {
      Id: Math.random().toString(36).substr(2, 9),
      SenderId: user.id,
      Text: messageText,
      FilePath: null,
      Type: 'Text',
      DateTime: new Date().toISOString(),
      status: 'Sent',
    };

    // Add to local state immediately (optimistic UI)
    setMessages(prevMessages => [...prevMessages, messageData]);

    // Scroll to bottom after adding new message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated: true});
      }
    }, 100);

    // Prepare WebSocket message event
    const socketEvent = {
      Id: messageData.Id,
      ConnectionMode: 1,
      Command: 70,
      FromUser: {Id: user.id},
      ToUserList: [{Id: serviceProviderId}],
      Message: JSON.stringify({
        Text: messageText,
        FilePath: null,
        CatFileTypeId: 0,
        MessageType: 'Text',
      }),
      timestamp: new Date().toISOString(),
    };

    // Send via WebSocket
    socketService.current
      .sendMessage(socketEvent)
      .then(response => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.Id === messageData.Id
              ? {...msg, isSent: true, isPending: false}
              : msg,
          ),
        );
      })
      .catch(err => {
        console.error('Failed to send message:', err);
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.Id === messageData.Id
              ? {...msg, isFailed: true, isPending: false}
              : msg,
          ),
        );
      });

    setMessageText('');
  };

  // Check if message is from current user
  const isOwnMessage = (message: any) => {
    return message.SenderId === patientId;
  };

  // Handle new incoming messages
  useEffect(() => {
    if (messages.length > 0 && !isFetchingMore && !isLoadingMore) {
      const lastMessage = messages[messages.length - 1];
      const isNewMessage =
        Date.now() - new Date(lastMessage.DateTime).getTime() < 5000 &&
        lastMessage.SenderId === user.id;

      // Auto-scroll to bottom for new messages from current user
      if (isNewMessage) {
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: true});
          }
        }, 100);
      }
    }
  }, [messages.length, isFetchingMore, isLoadingMore]);

  // View for rendering individual messages
  const renderMessage = ({item}: any) => {
    return <ChatMessageRender item={item} />;
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Force scroll to bottom when keyboard appears
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: true});
          }
        }, 100);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle scroll to bottom when keyboard is shown
  useEffect(() => {
    if (keyboardVisible && flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [keyboardVisible]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            fetchPreviousMessages(1);
          }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.containerChat}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      enabled>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.chatTitle}>Chat</Text>
          {!socketConnected && (
            <Text style={styles.connectionStatus}>Offline</Text>
          )}
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {isFetchingMore && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#0084ff" />
          <Text style={styles.loadingMoreText}>Loading older messages...</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.Id.toString()}
        contentContainerStyle={[
          styles.messagesContainer,
          {paddingBottom: keyboardVisible ? 100 : 20},
        ]}
        onScroll={handleScroll}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={32}
        renderItem={renderMessage}
        inverted={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        onScrollToIndexFailed={info => {
          console.log('Failed to scroll to index', info);
          // Use a safe fallback
          setTimeout(() => {
            if (messages.length > 0) {
              safeScrollToIndex(info.index);
            }
          }, 100);
        }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message"
          placeholderTextColor="#8a8a8a"
          multiline
          onFocus={() => {
            // Force scroll to bottom when input is focused
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({animated: true});
              }
            }, 100);
          }}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (messageText.trim() === '' || !socketConnected) &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={messageText.trim() == '' || !socketConnected}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    color: 'white',
    marginTop: 10,
  },
  loadingMoreContainer: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  loadingMoreText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0084ff',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  connectionStatus: {
    color: '#ff4d4d',
    fontSize: 12,
    marginTop: 2,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#0084ff',
    fontSize: 16,
  },
  chatTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#0084ff',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
  },
  sendingMessage: {
    opacity: 0.7,
  },
  failedMessage: {
    backgroundColor: '#ff4d4d',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'white',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  timestamp: {
    fontSize: 10,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusText: {
    fontSize: 12,
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
    backgroundColor: '#0084ff',
  },
  sendButtonDisabled: {
    backgroundColor: '#313131',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
