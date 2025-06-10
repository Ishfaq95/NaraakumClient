import axiosInstance from "../axios/axiosConfig";

export const getMessagesList = async (params: any): Promise<any> => {
    try {
        const response = await axiosInstance.post(
            'chat/Getmessages',
            params
        );
        return response.data;
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        throw {
            message: error?.response?.data?.message || 'Failed to fetch messages',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const getVideoSDKToken = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('videosdk/get-token');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching video SDK token:', error);
    }
};

export const messagesAndCallService = {
    getMessagesList,
    getVideoSDKToken    
}; 