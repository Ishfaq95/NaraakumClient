import PushNotification from "react-native-push-notification";
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';
import { setTopic } from "../redux/reducers/userReducer";
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import i18next from 'i18next';
import { store } from "../redux/store";

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

export const generatePayloadforOrderMainBeforePayment = (CardArray: any) => {
  
  const selectedLocation = store.getState().root.booking.selectedLocation;
  const payload = CardArray.map((item: any) => {
    // Convert time from 12-hour format with Arabic AM/PM to 24-hour format
    let schedulingTime = item.SchedulingTime;
    if (schedulingTime) {
      // Check if the time contains Arabic AM/PM indicators
      if (schedulingTime.includes('ص')) {
        // AM time - remove 'ص' and keep as is (already in 12-hour format)
        schedulingTime = schedulingTime.replace('ص', '').trim();
        // Convert to 24-hour format
        const [hours, minutes] = schedulingTime.split(':');
        const hour24 = parseInt(hours) === 12 ? 0 : parseInt(hours);
        schedulingTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;
      } else if (schedulingTime.includes('م')) {
        // PM time - remove 'م' and convert to 24-hour format
        schedulingTime = schedulingTime.replace('م', '').trim();
        const [hours, minutes] = schedulingTime.split(':');
        const hour24 = parseInt(hours) === 12 ? 12 : parseInt(hours) + 12;
        schedulingTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;
      }
    }

    // Convert SchedulingDate and SchedulingTime to UTC
    let schedulingDateUTC = item.SchedulingDate;
    let schedulingTimeUTC = schedulingTime;
    if (item.SchedulingDate && schedulingTime) {
      try {
        // Validate date format and create a proper date string
        const dateStr = item.SchedulingDate;
        const timeStr = schedulingTime;
        
        // Ensure we have valid date and time strings
        if (dateStr && timeStr && dateStr.includes('-') && timeStr.includes(':')) {
          // Create ISO string with proper format
          const dateTimeString = `${dateStr}T${timeStr}:00`;
          const localDateTime = new Date(dateTimeString);
          
          // Check if the date is valid
          if (!isNaN(localDateTime.getTime())) {
            schedulingDateUTC = localDateTime.toISOString().slice(0, 10); // 'YYYY-MM-DD' in UTC
            schedulingTimeUTC = localDateTime.toISOString().slice(11, 16); // 'HH:mm' in UTC
          } else {
            console.warn('Invalid date/time combination:', dateStr, timeStr);
            // Keep original values if conversion fails
            schedulingDateUTC = item.SchedulingDate;
            schedulingTimeUTC = schedulingTime;
          }
        } else {
          console.warn('Invalid date or time format:', dateStr, timeStr);
          // Keep original values if format is invalid
          schedulingDateUTC = item.SchedulingDate;
          schedulingTimeUTC = schedulingTime;
        }
      } catch (error) {
        console.error('Error converting date/time to UTC:', error);
        // Keep original values if conversion fails
        schedulingDateUTC = item.SchedulingDate;
        schedulingTimeUTC = schedulingTime;
      }
    }

    return ({
      "OrderDetailId": item.OrderDetailId || 0,
      "OrganizationId": item.OrganizationId,
      "CatCategoryId": item.CatCategoryId,
      "CatServiceId": item.CatServiceId,
      "CatCategoryTypeId": item.CatCategoryTypeId,
      "OrganizationServiceId": item.OrganizationServiceId,
      "ServiceCharges": item.ServiceCharges,
      "ServiceProviderloginInfoId": item.ServiceProviderUserloginInfoId,
      "CatSpecialtyId": item.CatSpecialtyId,
      "OrganizationSpecialtiesId": 0,
      "OrganizationPackageId": 0,
      "Quantity": 1,
      "SchedulingDate": schedulingDateUTC,
      "SchedulingTime": schedulingTimeUTC,
      "CatSchedulingAvailabilityTypeId": item.CatSchedulingAvailabilityTypeId,
      "AvailabilityId": item.AvailabilityId,
      "OrderAddress": selectedLocation?.address || "",
      "OrderAddressGoogleLocation": selectedLocation?.latitude + "," + selectedLocation?.longitude || "",
      "saveinAddress": false
    })
  })

  return payload

}

export const generatePayloadforUpdateOrderMainBeforePayment = (CardArray: any) => {

  const payload = CardArray.map((item: any) => {
    return ({
      "OrderDetailId": item.OrderDetailId,
      "OrganizationId": item.OrganizationId,
      "CatCategoryId": item.CatCategoryId,
      "CatServiceId": item.CatServiceId,
      "CatCategoryTypeId": item.CatCategoryTypeId,
      "OrganizationServiceId": item.OrganizationServiceId,
      "ServiceCharges": item.ServiceCharges,
      "ServiceProviderloginInfoId": item.ServiceProviderUserloginInfoId,
      "CatSpecialtyId": item.CatSpecialtyId,
      "OrganizationSpecialtiesId": item.OrganizationSpecialtiesId || 0,
      "OrganizationPackageId": item.OrganizationPackageId || 0,
      "Quantity": item.Quantity,
      "SchedulingDate": item.SchedulingDate,
      "SchedulingTime": item.SchedulingTime,
      "CatSchedulingAvailabilityTypeId": item.CatSchedulingAvailabilityTypeId || 0,
      "AvailabilityId": item.AvailabilityId,
      "PatientUserProfileInfoId": item.PatientUserProfileInfoId,
      "TextDescription": item.TextDescription,
      "OrderAddress": item.Address,
      "OrderAddressArea": item.Area,
      "OrderAddressGoogleLocation": item.GoogleLocation,
      "saveinAddress": false
    })
  })

  return payload
}

export const generatePayloadForCheckOut = (CardArray: any) => {
  
  const payload = CardArray.map((item: any) => {
    return ({
      "OrderDetailId": item.OrderDetailId,
      "OrganizationId": item.OrganizationId,
      "CatCategoryId": item.CatCategoryId,
      "CatServiceId": item.CatServiceId,
      "CatCategoryTypeId": item.CatCategoryTypeId,
      "OrganizationServiceId": item.OrganizationServiceId,
      "ServiceCharges": item.ServiceCharges,
      "ServiceProviderloginInfoId": item.ServiceProviderUserloginInfoId || 0,
      "CatSpecialtyId": item.CatSpecialtyId,
      "OrganizationSpecialtiesId": item.OrganizationSpecialtiesId || 0,
      "OrganizationPackageId": item.OrganizationPackageId || 0,
      "Quantity": item.Quantity,
      "SchedulingDate": item.SchedulingDate,
      "SchedulingTime": item.SchedulingTime,
      "CatSchedulingAvailabilityTypeId": item.CatSchedulingAvailabilityTypeId || 0,
      "AvailabilityId": item.AvailabilityId || 0,
      "PatientUserProfileInfoId": item.PatientUserProfileInfoId,
      "TextDescription": item.TextDescription,
      "OrderAddress": item.OrderAddress || "200 Geary St, San Francisco, CA 94102، الولايات المتحدة",
      "OrderAddressArea": item.OrderAddressArea || "200 Geary St, San Francisco, CA 94102، الولايات المتحدة",
      "OrderAddressGoogleLocation": item.OrderAddressGoogleLocation || "37.785834,-122.406417",
      "saveinAddress": false,
      "PromoCodeMainId": item.PromoCodeMainId || null,
      "DiscountAmount": item.DiscountAmount || null,
      "DiscountDescription": item.DiscountDescription || null
    })
  })
  return payload
}

export const generateUniqueId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};