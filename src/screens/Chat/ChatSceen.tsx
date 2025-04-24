// ChatScreen.js - Common chat component to be used with video call

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
} from 'react-native';
import useMutationHook from '../../Network/useMutationHook';
import {getMessagesList} from '../../Network/getMessagesList';
import {useSelector} from 'react-redux';
import ChatMessageRender from './ChatMessageRender';

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

  const flatListRef = useRef(null);
  const listContentOffsetY = useRef(0);
  const oldContentHeight = useRef(0);
  const newContentHeight = useRef(0);

  // Fetch previous messages and set up socket listeners
  useEffect(() => {
    setLoading(true);
    fetchPreviousMessages(1).finally(() => setLoading(false));
  }, []);

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
          isSeen: item.readByRecipient.status,
        };
        tempMessagesArray.push(message);
      });

      const reversedMessages = tempMessagesArray.reverse();

      if (page === 1) {
        setMessages(tempMessagesArray); // fresh load
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

  const sendMessage = () => {
    if (messageText.trim() === '') return;

    // You need to define messageData before using it
    const messageData = {
      Id: Date.now().toString(), // Temporary ID until server response
      SenderId: senderId,
      Text: messageText,
      FilePath: null,
      Type: 'text',
      DateTime: new Date().toISOString(),
      isSeen: false,
    };

    setMessages(prevMessages => [...prevMessages, messageData]);

    // Clear input
    setMessageText('');
  };

  const isOwnMessage = (message: any) => {
    return message.SenderId === senderId;
  };

  // Handle scroll to bottom only for new messages sent by user
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
        <Text style={styles.chatTitle}>Chat</Text>
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
        renderItem={({item}) => <ChatMessageRender item={item} />}
        inverted={false} // Make sure this is false since we're using standard order
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
            messageText.trim() === '' && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={messageText.trim() === ''}>
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
