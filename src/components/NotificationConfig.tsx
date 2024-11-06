import { Alert, AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { getReminderListFromApi } from '../shared/services/service';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../shared/utils/routes';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    // Extract notification data
    const { title, body } = remoteMessage.notification || {};
    if (title === "تم تقديم طلب جديد") {
        getReminderListFromApi();
    }
    // Display the notification
    PushNotification.localNotification({
        channelId: "channel-id", // Channel ID for the notification
        title: title,
        message: body,
    });
});

const NotificationsCenter = () => {
    const navigation = useNavigation();
    useEffect(() => {
        PushNotification.configure({
          onRegister: function (token) {
            console.log("TOKEN:", token);
          },
          onNotification: function (notification) {
            console.log("LOCAL NOTIFICATION ==>", notification);

            // Handle the notification
            if(notification?.title === "Reminder") {
              navigation.navigate(ROUTES.AlarmScreen, { data: notification });
            }
            
        
           if(Platform.OS=='ios'){
            notification.finish(PushNotificationIOS.FetchResult.NoData);
           }
          },
          permissions: {
            alert: true,
            badge: true,
            sound: true,
          },
          popInitialNotification: false,
          requestPermissions: false,
        });

        PushNotification.createChannel(
            {
              channelId: "channel-id", // Set the same ID used in notifications
              channelName: "Notification Channel", // Channel name
              importance: PushNotification.Importance.HIGH,
              vibrate: true,
            },
            (created) => console.log(`createChannel returned '${created}'`) // Callback to check if the channel was created successfully
          );

        // Handle the app opening from a background state
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage);
            // Handle the notification data
        });

        // Handle the app opening from a quit state
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage);
                    // Handle the notification data
                }
            });

        // Foreground message handler
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('Received in foreground:', remoteMessage); // Log entire remoteMessage
            const { title, body } = remoteMessage.notification || {};

            if (title === "تم تقديم طلب جديد") {
                getReminderListFromApi();
            }

            // Alert and local notification for foreground
            if (title && body) {
                Alert.alert(title, body); // Show alert
                PushNotification.localNotification({
                    channelId: "channel-id", // Channel ID for the notification
                    title: title,
                    message: body,
                    playSound: true,
                    soundName: 'default',
                });
            }
        });

        return unsubscribe; // Cleanup the listener on unmount
    }, []);

    useEffect(() => {
        // Check if app was launched from a notification (when app was killed)
        PushNotification.popInitialNotification((notification) => {
            if (notification) {
                console.log('App was launched from a notification:', notification);
                handleNotification(notification, 'killed');
            }
        });

        if(Platform.OS=='ios'){
            PushNotificationIOS.requestPermissions().then((data) => {
                console.log('PushNotificationIOS permissions:', data);
            });
    
            // Listener for handling notifications in the foreground
            const notificationListener = PushNotificationIOS.addEventListener('notification', (notification) => {
                console.log('Foreground Notification:', notification);
                handleNotification(notification, 'foreground');
            });
        }

        return () => {
            // notificationListener.remove(); // Cleanup the listener on unmount
        };
    }, []);

    // Custom notification handler for different states
    const handleNotification = (notification, state) => {
        const message = notification.message || notification.alert || 'You have received a notification';
        const title = notification.title || 'Notification';

        // Customize handling here based on state
        if (state === 'foreground') {
            // Handle notification for foreground
            console.log('Foreground Notification:', title, message);
        } else if (state === 'background') {
            // Handle notification for background
            console.log('Background Notification:', title, message);
        } else if (state === 'killed') {
            // Handle notification for killed state
            console.log('Killed State Notification:', title, message);
        }

        // Optionally, show a local notification for foreground state
        if (state === 'foreground') {
            PushNotification.localNotification({
                title: title,
                message: message,
                userInfo: notification.data, // Attach any additional data if needed
                playSound: true,
                soundName: 'default',
            });
        }
    };

    return null; // No UI component to render
};

export default NotificationsCenter;
