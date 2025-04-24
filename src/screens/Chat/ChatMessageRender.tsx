import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';

const ChatMessageRender = ({item}: any) => {
  const {user} = useSelector((state: any) => state.root.user);
  const isOwnMessage = (message: any) => {
    return message?.SenderId == user.id;
  };

  const formattedTime = dateString => {
    let date = new Date(dateString);
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // Months are zero-indexed
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // Format month and day to ensure two digits
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    let strTime = `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
    return strTime;
  };

  const renderMessageStatus = (message: any) => {
    // if (isOwnMessage(message)) {
    //   switch (message.status) {
    //     case 'sending':
    //       return <Text style={styles.statusText}>✓</Text>;
    //     case 'delivered':
    //       return <SingleTickIcon width={14} height={14} color="#8a8a8a" />;
    //     case 'read':
    //       return <BlueTick width={14} height={14} />;
    //     default:
    //       return null;
    //   }
    // }
    return null;
  };

  return (
    <View
      style={[
        styles.messageBubble,
        isOwnMessage(item) ? styles.ownMessage : styles.otherMessage,
        item.isSeen === 'sending' && styles.sendingMessage,
      ]}>
      <Text
        style={[
          styles.messageText,
          isOwnMessage(item) ? styles.ownMessageText : styles.otherMessageText,
        ]}>
        {item.Text}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.timestamp,
            isOwnMessage(item) ? styles.ownTimestamp : styles.otherTimestamp,
          ]}>
          {formattedTime(item.DateTime)}
        </Text>
        {/* {renderMessageStatus(item)} */}
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

export default ChatMessageRender;
