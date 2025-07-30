import { store } from "shared/redux/store";
import axiosInstance from "../axios/axiosConfig";

const getSystemNotification = async (params: any): Promise<any> => {
    try {
        const response = await axiosInstance.post(
            'reminders/GetSystemReminderList',
            params
        );
        return response.data;
    } catch (error: any) {
        console.error('Error fetching appointments:', error);
        throw {
            message: error?.response?.data?.message || 'Failed to fetch appointments',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

const sendNotificationForMeeting = async (ReciverId: any, data: any): Promise<any> => {
    try {
        const dataObj = {
            ReciverId: ReciverId,
            data: data,
          };
        const response = await axiosInstance.post('chat/FCMtojoinMeeting', JSON.stringify(dataObj));
        return response.data;
    } catch (error: any) {
        console.error('Error sending notification for meeting:', error);
    }
};

const getNotificationList = async (params: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetSystemNotification', params);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
    }
};

const updateNotification = async (params: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/UpdateSystemNotification', params);
        return response.data;
    } catch (error: any) {
        console.error('Error updating notification:', error);
    }
};

export const notificationService = {
    getSystemNotification,
    sendNotificationForMeeting,
    getNotificationList,
    updateNotification
}; 