import axiosInstance from "../axios/axiosConfig";

export const getUserFavorites = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserFavorites', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting user favorites:', error);
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
        console.error('Error getting refferal users by user id:', error);
        throw error;
    }
};

export const getUserAddresses = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserLocations', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting user locations:', error);
        throw error;
    }
};

export const getPatientRating = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserRatingForPatient', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting user rating for patient:', error);
        throw error;
    }
};

export const getVisitOrderList = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserOrderList', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting user order list:', error);
        throw error;
    }
};

export const getVisitConsultantLog = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('visitRecord/GetVisitRecordListByLoginUserId', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting visit record list:', error);
        throw error;    
    }
};

export const getCpAddedOrders = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('user/GetCPAddedOrderList', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting visit record list:', error);
        throw error;    
    }
};

export const updateUserProfile = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/UpdateRegisteredPatientProfile', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        throw error;    
    }
};

export const getUserUpdatedData = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('user/GetUserInfobyUserId', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error verifying user updated data:', error);
        throw error;    
    }
};

export const verifyUserUpdatedData = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/VerifyRegisteredUser', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error verifying user updated data:', error);
        throw error;    
    }
};

export const userUpdatedEmail = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/EmailVerification', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error updating email:', error);
        throw error;    
    }
};

export const userUpdatedPhone = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/PhoneVerification', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error updating phone:', error);
        throw error;    
    }
};

export const resendOtp = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/ResendRegistrationCode', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error resending otp:', error);
        throw error;    
    }
};

export const getUserOrderDetail = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('user/GetUserOrderDetail', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting user order detail:', error);
        throw error;        
    }
};

export const getVisitRecordList = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('visitRecord/GetVisitRecordListByOrderId', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting user order detail:', error);
        throw error;        
    }
};

export const getMedicalReport = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/GetPatientMedicalHistoryReports', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting medical report:', error);
        throw error;        
    }
};

export const getMedicalHistory = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/GetPatientMedicalHistory', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting medical history:', error);
        throw error;        
    }
};

export const getOrderDetailsAddedByServiceProvider = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('visitRecord/GetOrderDetailAddedByServiceProvider', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting order details:', error);
        throw error;        
    }
};

export const deleteOrderAddedByServiceProvider = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('payment/DeleteUnpaidOrder', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting order:', error);
        throw error;        
    }
};

export const getVisitMainRecordDetails = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('visitRecord/GetVisitMainRecordDetail', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error getting visit main record details:', error);
        throw error;        
    }
};

export const submitRating = async (payload: any): Promise<any> => { 
    try {
        const response = await axiosInstance.post('user/AddEditUserRating', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error submitting rating:', error);
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
    resendOtp,
    getUserOrderDetail,
    getVisitRecordList,
    getMedicalReport,
    getMedicalHistory,
    getOrderDetailsAddedByServiceProvider,
    deleteOrderAddedByServiceProvider,
    getVisitMainRecordDetails,
    submitRating
};  