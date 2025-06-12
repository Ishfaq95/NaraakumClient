import axiosInstance from "../axios/axiosConfig";

export const getServices = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('offeredServices/GetOfferedServicesCategories');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching video SDK token:', error);
    }
};

export const bookingService = {
    getServices
}; 