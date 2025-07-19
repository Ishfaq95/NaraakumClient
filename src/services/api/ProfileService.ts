import axiosInstance from "../axios/axiosConfig";

export const getUserFavorites = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserFavorites', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error uploading medical history reports:', error);
        throw error;
    }
};

export const removeFromFavorites = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/DeleteFavorites', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
};

export const getBeneficiaries = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetRefferalUsersByUserId', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
};

export const getUserAddresses = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserLocations', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
};

export const getPatientRating = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserRatingForPatient', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting patient rating:', error);
        throw error;
    }
};

export const getVisitOrderList = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserOrderList', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting visit order list:', error);
        throw error;
    }
};

export const getVisitConsultantLog = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('visitRecord/GetVisitRecordListByLoginUserId', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting visit consultant log:', error);
        throw error;    
    }
};

export const getCpAddedOrders = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('user/GetCPAddedOrderList', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting cp added orders:', error);
        throw error;    
    }
};

export const updateUserProfile = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/UpdateRegisteredPatientProfile', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting cp added orders:', error);
        throw error;    
    }
};

export const getUserUpdatedData = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('user/GetUserInfobyUserId', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting cp added orders:', error);
        throw error;    
    }
};

export const verifyUserUpdatedData = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/VerifyRegisteredUser', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting cp added orders:', error);
        throw error;    
    }
};

export const userUpdatedEmail = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/EmailVerification', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting cp added orders:', error);
        throw error;    
    }
};

export const userUpdatedPhone = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/PhoneVerification', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting cp added orders:', error);
        throw error;    
    }
};

export const resendOtp = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/ResendRegistrationCode', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting cp added orders:', error);
        throw error;    
    }
};

export const profileService = {
    getUserFavorites,
    removeFromFavorites,
    getBeneficiaries,
    getUserAddresses,
    getPatientRating,
    getVisitOrderList,
    getVisitConsultantLog,
    getCpAddedOrders,
    updateUserProfile,
    getUserUpdatedData,
    verifyUserUpdatedData,
    userUpdatedEmail,
    userUpdatedPhone,
    resendOtp
};  