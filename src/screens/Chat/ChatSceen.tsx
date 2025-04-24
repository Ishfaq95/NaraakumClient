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
} from 'react-native';
import useMutationHook from '../../Network/useMutationHook';
import {getMessagesList} from '../../Network/getMessagesList';
import {useSelector} from 'react-redux';
import ChatMessageRender from './ChatMessageRender';
import WebSocketService from '../../components/WebSocketService';

const ChatScreen = ({senderId, receiverId, onBackPress}: any) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const {user} = useSelector((state: any) => state.root.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mongoSenderId, setMongoSenderId] = useState(null);
  const [mongoReceiverId, setMongoReceiverId] = useState(null);
  const [mongoConverstionId, setMongoConverstionId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const flatListRef = useRef(null);
  const listContentOffsetY = useRef(0);
  const oldContentHeight = useRef(0);
  const socketService = useRef(WebSocketService.getInstance());
  const messagesEndRef = useRef(null);

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
    fetchPreviousMessages(1).finally(() => setLoading(false));

    // Cleanup function for component unmount
    return () => {
      // Don't disconnect globally, just remove listeners
      if (socketService.current.getSocket()) {
        socketService.current.getSocket().onmessage = null;
      }
    };
  }, []);

  // Fetch previous messages
  const fetchPreviousMessages = async (page = 1) => {
    if (!hasMoreMessages && page !== 1) return;
    if (isFetchingMore) return; // Prevent multiple simultaneous requests

    if (page > 1) setIsFetchingMore(true); // optional loader for "load more"

    try {
      const messages = await getMessagesList({
        PatientId: 1059,
        CareProviderId: 685,
        PageNumber: page,
        PageSize: 10,
      });

      const data = messages?.Data || [];

      if (data.length === 0) {
        setHasMoreMessages(false);
        return;
      }

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

      let tempMessagesArray: any = [];

      data.map((item: any) => {
        let message = {
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
        setMessages(tempMessagesArray); // fresh load
        sendReadReceipt();
      } else {
        // Save layout measurements before updating
        if (flatListRef.current) {
          oldContentHeight.current =
            flatListRef.current._listRef._totalCellLength || 0;
        }
        setMessages(prevMessages => [...tempMessagesArray, ...prevMessages]); // prepend older messages
      }

      if (data.length < 10) {
        setHasMoreMessages(false);
      } else {
        setPageNumber(prev => prev + 1);
      }
    } catch (error) {
      console.error('messages list error', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Send a message through WebSocket
  const sendMessage = () => {
    if (messageText.trim() === '' || !socketConnected || !mongoConverstionId)
      return;

    // Create message data
    const messageData = {
      Id: Math.random().toString(36).substr(2, 9), // Temporary ID until server response
      SenderId: user.id,
      Text: messageText,
      FilePath: null,
      Type: 'Text',
      DateTime: new Date().toISOString(),
      status: 'Sent',
    };

    // Add to local state immediately (optimistic UI)
    setMessages(prevMessages => [...prevMessages, messageData]);

    // Prepare WebSocket message event
    const socketEvent = {
      Id: messageData.Id,
      ConnectionMode: 1,
      Command: 70,
      FromUser: {Id: user.id},
      ToUserList: [{Id: 685}],
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
        // Mark message as sent
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
        // Mark message as failed
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.Id === messageData.Id
              ? {...msg, isFailed: true, isPending: false}
              : msg,
          ),
        );
      });

    // Clear input
    setMessageText('');
  };

  // Check if message is from current user
  const isOwnMessage = (message: any) => {
    return message.SenderId === senderId;
  };

  // Handle scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current && !isFetchingMore) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages.length]);

  // Handle maintaining scroll position when loading older messages
  const onContentSizeChange = (width, height) => {
    // Only adjust scroll if we're loading older messages (not on first load or new messages)
    if (isFetchingMore && flatListRef.current && oldContentHeight.current > 0) {
      const heightDifference = height - oldContentHeight.current;
      flatListRef.current.scrollToOffset({
        offset: heightDifference,
        animated: false,
      });
    }
    // Reset the height reference
    oldContentHeight.current = height;
  };

  // Track scroll position
  const handleScroll = event => {
    // Check if user has scrolled near the top to load more messages
    const offsetY = event.nativeEvent.contentOffset.y;
    listContentOffsetY.current = offsetY;

    // If user is near top and we're not already fetching, fetch more messages
    if (offsetY < 20 && hasMoreMessages && !isFetchingMore) {
      fetchPreviousMessages(pageNumber);
    }
  };

  // View for rendering individual messages
  const renderMessage = ({item}: any) => {
    return <ChatMessageRender item={item} />;
  };

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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
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
        contentContainerStyle={styles.messagesContainer}
        onScroll={handleScroll}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={16}
        renderItem={renderMessage}
        inverted={false}
        onEndReachedThreshold={0.1}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message"
          placeholderTextColor="#8a8a8a"
          multiline
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
