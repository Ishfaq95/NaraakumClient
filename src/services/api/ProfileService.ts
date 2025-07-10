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

export const profileService = {
    getUserFavorites,
    removeFromFavorites,
    getBeneficiaries,
    getUserAddresses,
    getPatientRating,
};  