import axiosInstance from "../axios/axiosConfig";

export const getServices = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('offeredServices/GetOfferedServicesCategories');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching video SDK token:', error);
    }
};

export const getOfferedServicesListByCategory = async (params: any): Promise<any> => {
    console.log("params", params);
    try {
        const response = await axiosInstance.post('offeredServices/GetOfferedServicesListByCategory', params);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching offered services by category:', error);
        throw error;
    }
};

export const getAllSpecialties = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('catalogue/GetAllSpecialties');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching all specialties:', error);
        throw error;
    }
};

export const bookingService = {
    getServices,
    getOfferedServicesListByCategory,
    getAllSpecialties
}; 