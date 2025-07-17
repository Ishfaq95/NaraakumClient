import axiosInstance from "../axios/axiosConfig";

export const getReminderSetting = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('reminders/GetUserReminderSetting', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting setting:', error);
        throw error;
    }
};

export const updateReminderSetting = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('reminders/AddUpdateUserReminderSetting', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error updating setting:', error);
        throw error;
    }
};

export const settingService = {
    getReminderSetting,
    updateReminderSetting
};  