import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { messagesAndCallService } from '../../services/api/MessagesAndCallService';
import { useDispatch, useSelector } from 'react-redux';
import { globalTextStyles } from '../../styles/globalStyles';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { MediaBaseURL } from '../../shared/utils/constants';
import { ROUTES } from '../../shared/utils/routes';
import WebSocketService from '../../components/WebSocketService';
import { setUnreadMessages } from '../../shared/redux/reducers/userReducer';

const ConversationListScreen = () => {
    const { t } = useTranslation();
    const user = useSelector((state: any) => state.root.user.user);
    const [conversationList, setConversationList] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const webSocketService = WebSocketService.getInstance();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    useEffect(() => {
        getConversationList();
    }, [isFocused]);

    const socketCommandHandler = (socketEvent: any) => {
        if (socketEvent.Command == 56) {
            const parsedData = JSON.parse(socketEvent.Message);
            const messageType = parsedData.MessageType;
            
            getConversationList();
            
        } else if(socketEvent.Command == 74){
            // Convert message string to number
            const messageCount = parseInt(socketEvent.Message, 10);
            // Dispatch only if the number is greater than 0
            if(messageCount > 0){
              dispatch(setUnreadMessages(socketEvent.Message));
            }else{
                dispatch(setUnreadMessages(0));
            }
          }
      }

    useEffect(() => {

        if (user) {
          const presence = 1;
          const communicationKey = user.CommunicationKey;
          const UserId = user.Id;
    
          // Only connect if not already connected
          if (!webSocketService.isSocketConnected()) {
            webSocketService.connect(presence, communicationKey, UserId);
          }
    
          // Get the socket instance and add message event listener
          const socket = webSocketService.getSocket();
          if (socket) {
            socket.onmessage = (event) => {
              try {
                const socketEvent = JSON.parse(event.data);
                socketCommandHandler(socketEvent);
              } catch (error) {
                console.error('Error parsing socket message:', error);
              }
            };
          }
        } else {
          webSocketService.disconnect();
        }
      }, [user]);

    const getConversationList = async () => {
        try {
            const payload = {
                "PatientId": user.Id
            }
            const response = await messagesAndCallService.getConversationList(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
                // Sort conversations by last message time in descending order (newest first)
                const sortedData = response.Data.sort((a: any, b: any) => {
                    const timeA = new Date(a.lastmessageTime || a.createdAt).getTime();
                    const timeB = new Date(b.lastmessageTime || b.createdAt).getTime();
                    return timeB - timeA; // Descending order (newest first)
                });
                setConversationList(sortedData);
            }
        } catch (error) {
            console.log(error);
        }

    }

    const onRefresh = async () => {
        setRefreshing(true);
        await getConversationList();
        setRefreshing(false);
    }

    const handleBack = () => {
        navigation.goBack();
    }

    const renderConversationTile = ({ item }: any) => {
        console.log("item", item);
        return (
            <TouchableOpacity
                style={styles.conversationTile}
                onPress={() => {
                    // Navigate to chat screen with conversation details
                    navigation.navigate(ROUTES.ChatScreenMainView, { patientId: item?.patientDetails?.userlogininfoId, serviceProviderId: item?.careproviderDetails?.userlogininfoId, displayName: item?.careproviderDetails?.username });
                }}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{
                            uri: `${MediaBaseURL}${item?.careproviderDetails?.profilePictureUrl}`
                        }}
                        style={styles.avatar}
                    />
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {item?.careproviderDetails?.username}
                        </Text>
                        <Text style={styles.timestamp}>
                            {moment(item.lastmessageTime).locale('en').fromNow()}
                        </Text>
                    </View>

                    <View style={styles.messageRow}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item?.lastmessage}
                        </Text>
                        {item.unseenmsgCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadCount}>
                                    {item?.unseenmsgCount > 99 ? '99+' : item?.unseenmsgCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text style={[globalTextStyles.h3, styles.headerTitle]}>{'محادثات الاطباء'}</Text>
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
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {renderHeader()}
            <View style={{ flex: 1 }}>
                <FlatList
                    data={conversationList}
                    renderItem={renderConversationTile}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    refreshControl={undefined}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headerTitle: {
        color: '#000'
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    bookButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    conversationTile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        ...globalTextStyles.bodyLarge,
        fontWeight: '600',
        color: '#000',
    },
    timestamp: {
        ...globalTextStyles.bodySmall,
        color: '#666',
        fontSize: 12,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        ...globalTextStyles.bodyMedium,
        color: '#666',
    },
    unreadBadge: {
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ConversationListScreen