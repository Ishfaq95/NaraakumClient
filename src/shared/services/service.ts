import PushNotification from "react-native-push-notification";
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';
import { setTopic } from "../redux/reducers/userReducer";
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import i18next from 'i18next';

export const isTokenExpired = (expiresAt: any) => {
  return new Date() > new Date(expiresAt);
};

export const scheduleNotificationAndroid = async (notificationList: any) => {
  await notifee.cancelAllNotifications();

  try {
    for (const item of notificationList) {
      const localDate = new Date(item.ReminderDate);

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: localDate.getTime(), // cleaner and safer
      };
      await notifee.createTriggerNotification(
        {
          id: `reminder-${item.Id}`,
          title: item.Subject || 'Reminder',
          body: item.NotificationBody || 'You have a reminder',
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
          data: {
            CatNotificationPlatformId: item.CatNotificationPlatformId,
            CreatedDate: item.CreatedDate,
            Id: item.Id,
            NotificationBody: item.NotificationBody,
            ReceiverId: item.ReceiverId,
            ReminderDate: item.ReminderDate,
            SchedulingDate: item.SchedulingDate,
            SchedulingTime: item.SchedulingTime,
            Subject: item.Subject,
            TaskId: item.TaskId,
            VideoSDKMeetingId: item.VideoSDKMeetingId || 'Not Found',
            notificationFrom: 'reminder',
            meetingInfo: item.meetingInfo[0],
          },
        },
        trigger,
      );
    }

    const notifeeNotifs = await notifee.getTriggerNotifications();
  } catch (error) { }
};

export const scheduleNotificationIOS = (notificationList: any) => {
  notificationList.map((item: any, index: any) => {
    const data = item;
    // Convert UTC date string to local Date object
    const localDate = new Date(data.ReminderDate); // Date object auto-adjusts to local timezone

    // Optional: skip past dates
    if (localDate <= new Date()) {
      return;
    }

    const reminderObj = {
      ...item,
      meetingInfo: item.meetingInfo[0],
      notificationFrom: 'reminder',
    };

    PushNotification.localNotificationSchedule({
      id: data.Id,
      title: data.Subject,
      message: data.NotificationBody,
      date: localDate,
      // date: new Date(Date.now() + 60 * 1000),
      playSound: true,
      soundName: 'default',
      userInfo: reminderObj,
      allowWhileIdle: true, // important for background
    });
  });

  PushNotification.getScheduledLocalNotifications(notifs => { });
};

export const requestiOSPermissions = async () => {
  const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
  const microphonePermission = await request(PERMISSIONS.IOS.MICROPHONE);
  const photoLibraryPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
  const mediaLibraryPermission = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);

  if (
    cameraPermission === RESULTS.GRANTED &&
    microphonePermission === RESULTS.GRANTED &&
    photoLibraryPermission === RESULTS.GRANTED &&
    mediaLibraryPermission === RESULTS.GRANTED
  ) {
    return true;
  } else {
    return false;
  }
};

export const requestAndroidPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ]);

    if (
      granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error('Permission request error:', err);
    return false;
  }
};

export const subsribeTopic = (Id: any, topic: any, dispatch: any) => {
  const topicName = `patient_${Id}`;

  if (topic) {
    if (topic != topicName) {
      messaging()
        .unsubscribeFromTopic(topic)
        .then(() => { });

      dispatch(setTopic(topicName));

      messaging()
        .subscribeToTopic(topicName)
        .then(() => { });
    }
  } else {
    dispatch(setTopic(topicName));
    messaging()
      .subscribeToTopic(topicName)
      .then(() => { });
  }
};

export const getStatusStyle = (statusId: string | number) => {
  // Convert statusId to number if it's a string
  const numericStatusId = typeof statusId === 'string' ? parseInt(statusId, 10) : statusId;

  switch (numericStatusId) {
    case 1:
      return {
        backgroundColor: '#edfbfe',
        borderColor: '#50c8e1',
        text: i18next.t('تم حجز الخدمة')
      };
    case 17:
      return {
        backgroundColor: '#edfbfe',
        borderColor: '#50c8e1',
        text: i18next.t('قبول الطلب')
      };
    case 7:
      return {
        backgroundColor: '#fef6e2',
        borderColor: '#ffde7a',
        text: i18next.t('الممارس الصحي في طريقه اليك')
      };
    case 8:
      return {
        backgroundColor: '#d2f9cd',
        borderColor: '#2ab318',
        text: i18next.t('تم تلقي الخدمة')
      };
    case 10:
      return {
        backgroundColor: '#d2f9cd',
        borderColor: '#2ab318',
        text: i18next.t('اكتملت الخدمة')
      };
    case 24:
      return {
        backgroundColor: '#ececec',
        borderColor: '#838a98',
        text: i18next.t('فاتت')
      };
    default:
      return {
        backgroundColor: '#edfbfe',
        borderColor: '#50c8e1',
        text: i18next.t('قبول الطلب')
      };
  }
};

export const getDuration = (appointment: any) => {
  if (!appointment?.SchedulingTime || !appointment?.SchedulingEndTime) {
    return '';
  }

  // Convert times to local moment objects
  const startTime = moment.utc().set({
    hours: parseInt(appointment.SchedulingTime.split(':')[0]),
    minutes: parseInt(appointment.SchedulingTime.split(':')[1])
  }).local();

  const endTime = moment.utc().set({
    hours: parseInt(appointment.SchedulingEndTime.split(':')[0]),
    minutes: parseInt(appointment.SchedulingEndTime.split(':')[1])
  }).local();

  const durationInMinutes = endTime.diff(startTime, 'minutes');

  if (durationInMinutes > 0 && durationInMinutes < 60) {
    return `${durationInMinutes} ${i18next.t('دقيقة')}`;
  }

  return `${durationInMinutes} ${i18next.t('1 ساعة')}`;
}

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return moment.utc(dateString).local().format('DD/MM/YYYY');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatTime = (timeString: string) => {
  if (!timeString) return '';
  try {
    // If timeString is in ISO format
    if (timeString.includes('T')) {
      return moment.utc(timeString).local().format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
    }
    
    // If timeString is just time (HH:mm)
    const [hours, minutes] = timeString.split(':');
    const date = moment.utc().set({ hours: parseInt(hours), minutes: parseInt(minutes) });
    return date.local().format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};