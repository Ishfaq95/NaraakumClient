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

export const getServiceProviderSchedulingAvailability = async (params: {
    CatServiceId: string;
    CatSpecialtyId: number;
    StartDate: string;
    PageNumber: number;
    PageSize: number;
}): Promise<any> => {
    try {
        const response = await axiosInstance.post('organization/GetServiceProviderSchedulingAvailability', params);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching service provider scheduling availability:', error);
        throw error;
    }
};

export const getServiceProviderListByService = async (params: {
    CatcategoryId: string;
    ServiceIds: string;
    Search: string;
    PatientLocation: any;
    CatCityId: any;
    CatSquareId: any;
    Gender: number;
    PageNumber: number;
    PageSize: number;
}): Promise<any> => {
    try {
        const response = await axiosInstance.post('offeredServices/GetServiceProviderListByService', params);

        return response.data;
    } catch (error: any) {
        console.error('Error fetching service provider list:', error);
        throw error;
    }
};

// New API: GetUpdatedWallet
export const getUpdatedWallet = async (payload: { UserLoginInfoId: number }): Promise<any> => {
    try {
        const response = await axiosInstance.post('payment/GetUpdatedWallet', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching updated wallet:', error);
        throw error;
    }
};

export const createOrderMainBeforePayment = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('payment/CreateOrderMainBeforePayment', payload);

        return response.data;
    } catch (error: any) {
        console.error('Error creating order before payment:', error);
        throw error;
    }
};

export const updateOrderMainBeforePayment = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('payment/UpdateOrderMainBeforePayment', payload);

        return response.data;
    } catch (error: any) {
        console.error('Error creating order before payment:', error);
        throw error;
    }
};

export const updateOrderMainToCheckOut = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('payment/UpdateOrderMainToCheckOut', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error creating order before payment:', error);
        throw error;
    }
};

export const getUnPaidUserOrders = async (payload: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('payment/GetUserUnpaidOrderList', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error creating order before payment:', error);
        throw error;
    }
};

export const deleteOrderMainBeforePayment = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('payment/DeleteUnpaidServiceFromCart', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting order before payment:', error);
        throw error;
    }
};

    export const bookingService = {
    getServices,
    getOfferedServicesListByCategory,
    getAllSpecialties,
    getServiceProviderSchedulingAvailability,
    getServiceProviderListByService,
    getUpdatedWallet,
    createOrderMainBeforePayment,
    updateOrderMainBeforePayment,
    updateOrderMainToCheckOut,
    getUnPaidUserOrders,
    deleteOrderMainBeforePayment
}; 