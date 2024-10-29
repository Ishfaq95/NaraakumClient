// apiService.ts

import { store } from "../shared/redux/store";

export const GetReminderList = async () => {
  const token = store.getState().root.user.token;
  const topic = store.getState().root.user.topic;
  const url='https://hhcnode.innotech-sa.com/api/reminders/GetSystemReminderList'
  // const url='https://nk-pro-apis.innotech-sa.com/api/reminders/GetSystemReminderList';
  // const url='https://stghhcapis.innotech-sa.com/api/reminders/GetSystemReminderList';
  
  // const UserProfileId=store.getState().root.user.userinfo.Id;
  const splitString = topic.split("_");
  const UserloginInfo = splitString[1]
  console.log('UserloginInfo',UserloginInfo)
  const data={
    "UserloginInfo":UserloginInfo
    }
  try {
    const response = await fetch(url, {
      method: 'POST', // or 'GET', 'PUT', 'DELETE' as needed
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add Bearer token to headers
        // Add any additional headers if needed
      },
      body: JSON.stringify(data), // For POST or PUT requests
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
};
