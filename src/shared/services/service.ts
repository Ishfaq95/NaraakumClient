import {NativeModules, Platform} from 'react-native';
import {GetReminderList} from '../../Network/GetReminderList';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import moment from 'moment-timezone';

const {AlarmModule} = NativeModules;

export const isTokenExpired = (expiresAt: any) => {
  return new Date() > new Date(expiresAt);
};

export const getReminderListFromApi = async () => {
  const reminderList = await GetReminderList();
  const {ReminderList} = reminderList;

  const scheduleNotification = (item, fireDate) => {
    // Check for existing notifications with the same ID using getPendingNotificationRequests
    PushNotificationIOS.getPendingNotificationRequests((notifications) => {
      const isAlreadyScheduled = notifications.some(
        (notification) => notification.identifier === item.Id
      );
  
      if (!isAlreadyScheduled) {
        // Schedule the notification if it isn't already scheduled
        PushNotificationIOS.addNotificationRequest({
          id: item.Id,
          title: 'Reminder',
          body: 'Your upcoming appointment',
          userInfo: item,
          fireDate: fireDate, // Convert to local Date object
        });
      } else {
        console.log('Notification already scheduled');
      }
    });
  };

  ReminderList.map((item: any) => {
    const getSeconds = getSecondsFromCurrentTime(item.ReminderDate);
    if (getSeconds > 0) {
      if (Platform.OS == 'android') {
        AlarmModule.scheduleAlarm(
          getSeconds,
          item.NotificationBody,
          item.Subject,
          Number(item.Id),
          item.ReminderDate,
          item.VideoSDKMeetingId,
        );
      } else {
        console.log('ios', moment.utc(item.ReminderDate).local().toDate());

        const currentDate = new Date();

        const fireDate = new Date(currentDate.getTime() + getSeconds * 1000);

        console.log('fireDate', fireDate);
        scheduleNotification(item,fireDate)

        // PushNotificationIOS.addNotificationRequest({
        //   id: 'naraakum',
        //   title: 'Reminder',
        //   body: 'Your upcoming appointment',
        //   userInfo: item,
        //   fireDate: fireDate, // Convert to local Date object
        // });

        // PushNotificationIOS.addNotificationRequest({
        //   id: 'naraakum',
        //   title: 'Reminder',
        //   body: 'Your upcoming appointment',
        //   userInfo: item,
        //   fireDate: moment.utc(item.ReminderDate).local().toDate(), // Convert to local Date object
        // });
      }
    }
  });
};

// Function to convert UTC time to local mobile time and get the difference in seconds
const getSecondsFromCurrentTime = reminderDateUTC => {
  // Convert UTC time to local mobile time using JavaScript's Date object
  const reminderDate = new Date(reminderDateUTC); // This is in UTC
  const localReminderDate = new Date(
    reminderDate.getTime() + reminderDate.getTimezoneOffset() * 60000,
  ); // Convert UTC to local time

  // Get the current local time
  const currentDate = new Date();

  // Calculate the difference in seconds
  const differenceInSeconds = Math.floor(
    (localReminderDate - currentDate) / 1000,
  );

  return differenceInSeconds;
};
