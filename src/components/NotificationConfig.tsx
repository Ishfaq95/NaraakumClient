import { Alert, AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    // Extract notification data
    const { title, body }:any = remoteMessage.notification;
    console.log('i am called in killed state',title)
    // Display the notification
    PushNotification.localNotification({
        channelId: "channel-id", // Channel ID for the notification
        title: title,
        message: body,
    });
});

const NotificationsCenter = () => {
    useEffect(() => {
        console.log('hello')
        PushNotification.configure({
            onNotification: function (notification) {
                // process the notification
            },
            popInitialNotification: true,
            requestPermissions: true,
        });

        // Handle the app opening from a background state
        messaging().onNotificationOpenedApp(remoteMessage => {
            // Handle the notification data
        });

        // Handle the app opening from a quit state
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    // Handle the notification data
                }
            });

        // Foreground message handler
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('remoteMessage',remoteMessage)
            let notificationData = JSON.stringify(remoteMessage)
            let parsedData = JSON.parse(notificationData);

            let title = parsedData.notification?.title;
            let body = parsedData.notification?.body;

            Alert.alert(title, body);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        // Check if app was launched from a notification (when app was killed)
        PushNotification.popInitialNotification((notification) => {
          if (notification) {
            console.log('App was launched from a notification:', notification);
            handleNotification(notification, 'killed');
          }
        });
    
        // Listener for handling notifications in the foreground
        const notificationListener = PushNotificationIOS.addEventListener('notification', (notification) => {
          console.log('Foreground Notification:', notification);
          handleNotification(notification, 'foreground');
        });
    
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

    return null;
};

export default NotificationsCenter;