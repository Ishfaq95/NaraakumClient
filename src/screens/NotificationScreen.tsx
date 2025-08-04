import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import Header from '../components/common/Header';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../assets/icons/RightArrow';
import { useTranslation } from 'react-i18next';
import FullScreenLoader from '../components/FullScreenLoader';
import { globalTextStyles } from '../styles/globalStyles';
import moment from 'moment';
import 'moment/locale/ar';
import { CAIRO_FONT_FAMILY } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { setNotificationList } from '../shared/redux/reducers/userReducer';
import { useDispatch, useSelector } from 'react-redux';
import { notificationService } from '../services/api/NotificationService';
import { formatDate, formatTime } from '../shared/services/service';


const NotificationScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const user = useSelector((state: any) => state.root.user.user);
    const isFocused = useIsFocused();
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            getNotificationList();
        }
    }, [isFocused, user]);

    const updateNotification = async (notification: any) => {
        const payload = {
            "NotificationOccerrenceSystemId": notification.Id,
        }
        const response = await notificationService.updateNotification(payload);
        if (response.ResponseStatus.STATUSCODE == 200) {
            getNotificationList();
        } else {
        }
    }

    const getNotificationList = async (page: number = 1, isRefresh: boolean = false) => {
        if (page === 1) {
            setIsLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const payload = {
                "ReciverId": user.Id,
                "Viewstatus": 0,
                "PageNumber": page,
                "PageSize": 10
            }

            const response = await notificationService.getNotificationList(payload);

            if (response.ResponseStatus.STATUSCODE == 200) {

                dispatch(setNotificationList(response.TotalRecord));

                const newNotifications = response.Notifications || [];

                if (isRefresh || page === 1) {
                    setNotifications(newNotifications);
                    setPageNumber(1);
                } else {
                    setNotifications(prev => [...prev, ...newNotifications]);
                }

                // Check if there's more data
                const totalLoaded = isRefresh || page === 1 ?
                    newNotifications.length :
                    notifications.length + newNotifications.length;

                const hasMore = totalLoaded < response.TotalRecord && newNotifications.length > 0;
                setHasMoreData(hasMore);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await getNotificationList(1, true);
        setRefreshing(false);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMoreData && notifications.length > 0) {
            const nextPage = pageNumber + 1;
            setPageNumber(nextPage);
            getNotificationList(nextPage);
        }
    };

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text style={styles.headerTitle}>{t('notifications')}</Text>
            }
            leftComponent={
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ArrowRightIcon />
                </TouchableOpacity>
            }
            containerStyle={styles.headerContainer}
        />
    );

    const renderNotificationItem = ({ item }: { item: any }) => {
        // Convert UTC to local time and format
        const formatDateTime = (date: string, time: string) => {
            try {
                // Combine date and time and parse as UTC
                const utcDateTime = moment.utc(`${date} ${time}`);

                // Convert to local time
                const localDateTime = utcDateTime.local();

                // Format date and time
                const formattedDate = localDateTime.format('DD/MM/YYYY');
                const formattedTime = localDateTime.format('HH:mm');
                const isAM = localDateTime.format('A') === 'AM';
                const amPmText = isAM ? 'ص' : 'م';

                return `${formattedTime} ${amPmText} ${formattedDate}`;
            } catch (error) {
                console.error('Error formatting date/time:', error);
                return `${time} ${date}`;
            }
        };

        const formattedDateTime = formatDateTime(item.SchedulingDate, item.SchedulingTime);

        return (
            <TouchableOpacity
                style={[styles.notificationCard]}
                onPress={() => updateNotification(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.bellIcon]}>
                            <Ionicons name="notifications" size={24} color="black" />
                        </View>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.titleText,]}>
                            {item.NSubject}
                        </Text>
                        <Text style={[styles.messageText]}>
                            {item.NBody}
                        </Text>
                        <Text style={styles.timeText}>
                            {formattedDateTime}
                        </Text>
                    </View>

                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('no_notifications')}</Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore || notifications.length === 0) return null;

        return (
            <View style={styles.footerLoader}>
                <Text style={styles.loadingText}>Loading more notifications...</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <View style={styles.contentContainer}>
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.Id?.toString()}
                    style={styles.listContainer}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#23a2a4']}
                            tintColor="#23a2a4"
                        />
                    }
                    ListEmptyComponent={renderEmptyComponent}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    removeClippedSubviews={false}
                />
            </View>

            <FullScreenLoader visible={isLoading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerTitle: {
        ...globalTextStyles.h3,
        color: '#000',
    },
    backButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadCard: {
        borderLeftColor: '#23a2a4',
        backgroundColor: '#f8fffe',
    },
    cardContent: {
        flexDirection: 'row',
        padding: 10,
        width: '100%',
    },
    textContainer: {
        width: '85%',
        alignItems: 'flex-start'
    },
    titleText: {
        ...globalTextStyles.bodyMedium,
        color: '#666',
        textAlign: 'left',
        marginBottom: 4,
        fontFamily: CAIRO_FONT_FAMILY.medium,
    },
    messageText: {
        ...globalTextStyles.bodyMedium,
        color: '#666',
        textAlign: 'left',
        marginBottom: 8,
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    timeText: {
        ...globalTextStyles.bodySmall,
        color: '#666',
        textAlign: 'left',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
    unreadText: {
        color: '#333',
        fontFamily: CAIRO_FONT_FAMILY.semiBold,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '15%'
    },
    bellIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f4f4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadIcon: {
        backgroundColor: '#23a2a4',
    },
    bellIconText: {
        fontSize: 18,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        ...globalTextStyles.bodyMedium,
        color: '#999',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingText: {
        ...globalTextStyles.bodySmall,
        color: '#666',
        textAlign: 'center',
    },
});

export default NotificationScreen;
