import PushNotification from "react-native-push-notification";
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid, Platform } from 'react-native';
import { setTopic } from "../redux/reducers/userReducer";
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import i18next from 'i18next';
import { store } from "../redux/store";
import CryptoJS from 'crypto-js';
import { encode as btoa } from 'base-64';
import { convertLocalToUTCDateTime } from "../../utils/timeUtils";
import { categoriesList } from "../../services/api/BookingService";

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
        timestamp: localDate.getTime(),
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

    // const notifeeNotifs = await notifee.getTriggerNotifications();
  } catch (error) { }
};

export const scheduleNotificationIOS = (notificationList: any) => {
  notificationList.map((item: any, index: any) => {
    const data = item;
    const localDate = new Date(data.ReminderDate);

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
      playSound: true,
      soundName: 'default',
      userInfo: reminderObj,
      allowWhileIdle: true,
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
    const androidVersion = Number(Platform.Version);

    let permissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ];

    if (androidVersion < 30) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
    }

    const granted = await PermissionsAndroid.requestMultiple(permissions);

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

  return `${i18next.t('1 ساعة')}`;
}

export const convertArabicTimeTo24Hour = (timeString: string): string => {
  if (!timeString) return timeString;

  const parts = timeString.trim().split(' ');
  if (parts.length < 2) {
    return timeString;
  }

  const timePart = parts[0];
  const periodPart = parts[1];

  const [hours, minutes] = timePart.split(':').map(Number);

  let hour24 = hours;

  if (periodPart === 'ص') {
    if (hours === 12) {
      hour24 = 0;
    }
  } else if (periodPart === 'م') {
    if (hours !== 12) {
      hour24 = hours + 12;
    }
  } else {
  }

  const result = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return result;
};

export const convert24HourToArabicTime = (timeString: string): string => {
  if (!timeString) return timeString;
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const hour12 = hours % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return moment.utc(dateString).local().locale("en").format('DD/MM/YYYY');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatTime = (timeString: string) => {
  if (!timeString) return '';
  try {
    if (timeString.includes('T')) {
      return moment.utc(timeString).local().locale("en").format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
    }

    const [hours, minutes] = timeString.split(':');
    const date = moment.utc().set({ hours: parseInt(hours), minutes: parseInt(minutes) });
    return date.local().locale("en").format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

export const generatePayloadforOrderMainBeforePayment = (CardArray: any) => {

  const selectedLocation = store.getState().root.booking.selectedLocation;
  const user = store.getState().root.user.user;
  const category = store.getState().root.booking.category;
  const payload = CardArray
    .map((item: any) => {

      const displayCategory = categoriesList.find((catItem: any) => catItem.Id == item.CatCategoryId);
      const shouldSkipThisItem = displayCategory?.Display == "CP"
        ? !item.ServiceProviderUserloginInfoId
        : !item.OrganizationId;

      if (shouldSkipThisItem) {
        return undefined;
      }

      let schedulingDate = item.SchedulingDate;
      let schedulingTime = item.SchedulingTime;
      if (schedulingDate.includes("T")) {
        schedulingDate = schedulingDate.split("T")[0];
      }
      if (schedulingTime.includes("T")) {
        schedulingTime = schedulingTime.split("T")[1];
      }
      const { utcDate, utcTime } = convertLocalToUTCDateTime(schedulingDate, schedulingTime);
      let schedulingDateUTC = utcDate;
      let schedulingTimeUTC = utcTime;

      return ({
        "OrderDetailId": item.OrderDetailId || 0,
        "OrganizationId": item.OrganizationId,
        "CatCategoryId": item.CatCategoryId,
        "CatServiceId": item.CatServiceId,
        "CatCategoryTypeId": item.CatCategoryTypeId,
        "OrganizationServiceId": item.OrganizationServiceId,
        "ServiceCharges": item.CatNationalityId == "213" ? item.ServiceCharges : item.PriceswithTax ? item.PriceswithTax : item.ServiceCharges,
        "ServiceProviderloginInfoId": item.ServiceProviderUserloginInfoId || item.ServiceProviderloginInfoId,
        "CatSpecialtyId": item.CatSpecialtyId || 0,
        "OrganizationSpecialtiesId": 0,
        "OrganizationPackageId": 0,
        "Quantity": item.Quantity || 1,
        "SchedulingDate": schedulingDateUTC,
        "SchedulingTime": schedulingTimeUTC,
        "CatSchedulingAvailabilityTypeId": item.CatSchedulingAvailabilityTypeId,
        "AvailabilityId": item.AvailabilityId,
        "OrderAddress": selectedLocation?.address || "",
        "OrderAddressGoogleLocation": selectedLocation?.latitude + "," + selectedLocation?.longitude || "",
        "saveinAddress": false,
        "PatientUserProfileInfoId": user.UserProfileInfoId,
      })
    })
    .filter(Boolean);

  return payload
}

export const generatePayloadforUpdateOrderMainBeforePayment = (CardArray: any) => {

  const payload = CardArray.map((item: any) => {
    let schedulingDate = item.SchedulingDate;
    let schedulingTime = item.SchedulingTime;
    if (schedulingDate.includes("T")) {
      schedulingDate = schedulingDate.split("T")[0];
    }
    if (schedulingTime.includes("T")) {
      schedulingTime = schedulingTime.split("T")[1];
    }
    const { utcDate, utcTime } = convertLocalToUTCDateTime(schedulingDate, schedulingTime);
    let schedulingDateUTC = utcDate;
    let schedulingTimeUTC = utcTime;
    return ({
      "OrderDetailId": item.OrderDetailId,
      "OrganizationId": item.OrganizationId,
      "CatCategoryId": item.CatCategoryId,
      "CatServiceId": item.CatServiceId,
      "CatCategoryTypeId": item.CatCategoryTypeId,
      "OrganizationServiceId": item.OrganizationServiceId,
      "ServiceCharges": item.CatNationalityId == "213" ? item.ServicePrice : item.ServiceCharges,
      "ServiceProviderloginInfoId": item.ServiceProviderUserloginInfoId,
      "CatSpecialtyId": item.CatSpecialtyId,
      "OrganizationSpecialtiesId": item.OrganizationSpecialtiesId || 0,
      "OrganizationPackageId": item.OrganizationPackageId || 0,
      "Quantity": item.Quantity,
      "SchedulingDate": schedulingDateUTC,
      "SchedulingTime": schedulingTimeUTC,
      "CatSchedulingAvailabilityTypeId": item.CatSchedulingAvailabilityTypeId || 0,
      "AvailabilityId": item.AvailabilityId,
      "PatientUserProfileInfoId": item.PatientUserProfileInfoId,
      "TextDescription": item.TextDescription,
      "AudioDescription": item.AudioDescription,
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

export function encryptText(text: any, key: any) {
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return btoa(encrypted);
}

export const generatePayloadForUploadMedicalhistoryReports = (homeDialysisFilePaths: any) => {
  const payload = homeDialysisFilePaths.map((item: any) => {
    let ResourceCategoryId = '2';
    let fileType = item.split('.').pop();
    if (fileType == 'pdf' || fileType == 'PDF') ResourceCategoryId = '4';
    else if (
      fileType == 'jpg' ||
      fileType == 'jpeg' ||
      fileType == 'gif' ||
      fileType == 'png' ||
      fileType == 'JPG' ||
      fileType == 'JPEG' ||
      fileType == 'GIF' ||
      fileType == 'PNG'
    )
      ResourceCategoryId = '1';

    return ({
      "CatFileTypeId": ResourceCategoryId,
      "CatPatientUploadedFileTypeId": 8,
      "FileName": "HemoDiyalsis Report",
      "FilePath": item
    })
  })

  return payload
}