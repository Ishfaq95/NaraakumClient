import { NativeModules, Platform } from "react-native";
import { GetReminderList } from "../../Network/GetReminderList";

const { AlarmModule } = NativeModules;

export const isTokenExpired = (expiresAt:any) => {
    return new Date() > new Date(expiresAt);
  };

  export const getReminderListFromApi=async ()=>{
    const reminderList= await GetReminderList();
    const {ReminderList}=reminderList;
    
    ReminderList.map((item:any)=>{
      const getSeconds= getSecondsFromCurrentTime(item.ReminderDate)
      if(getSeconds>0){
        if(Platform.OS=='android'){
          AlarmModule.scheduleAlarm(getSeconds,item.NotificationBody,item.Subject,Number(item.Id),item.ReminderDate,item.VideoSDKMeetingId)
        }
      }
    })
  }


    // Function to convert UTC time to local mobile time and get the difference in seconds
    const getSecondsFromCurrentTime = (reminderDateUTC) => {
      // Convert UTC time to local mobile time using JavaScript's Date object
      const reminderDate = new Date(reminderDateUTC); // This is in UTC
      const localReminderDate = new Date(reminderDate.getTime() + reminderDate.getTimezoneOffset() * 60000); // Convert UTC to local time
  
      // Get the current local time
      const currentDate = new Date();
  
      // Calculate the difference in seconds
      const differenceInSeconds = Math.floor((localReminderDate - currentDate) / 1000);
  
      return differenceInSeconds;
    };