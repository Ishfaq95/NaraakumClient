import axiosInstance from "../axios/axiosConfig";

export const categoriesList = [
    { Id: 10, Name: "Nursing Visit", Display: "HP", CatLinkingTypeId: "3", CatCategoryTypeId: "3" }, //New Request --payment received
    { Id: 32, Name: "Doctor Visit", Display: "CP", CatLinkingTypeId: "2", CatCategoryTypeId: "2" },
    //{ Id: 33, Name: "Telemedicine", Display: "CP", CatLinkingTypeId: "2", CatCategoryTypeId:"2"},
    { Id: 34, Name: "Physiotherapy", Display: "CP", CatLinkingTypeId: "1", CatCategoryTypeId: "3" },
    { Id: 35, Name: "Laboratory Analysis", Display: "HP", CatLinkingTypeId: "3", CatCategoryTypeId: "1" },
    { Id: 36, Name: "Caregiver", Display: "CP", CatLinkingTypeId: "1", CatCategoryTypeId: "3" },
    { Id: 41, Name: "Home dialysis", NameSLang: "غسيل الكلي المنزلي", Display: "HP", CatLinkingTypeId: "1", CatCategoryTypeId: "3" },
    { Id: 42, Name: "Remote Consultation", NameSLang: "استشارة عن بعد ", Display: "CP", CatLinkingTypeId: "2", CatCategoryTypeId: "4" },
]

export const getServices = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('offeredServices/GetOfferedServicesCategories');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching Categories:', error);
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

export const getUserSavedAddresses = async (payload: any): Promise<any> => {
    
    try {
        const response = await axiosInstance.post('user/GetUserLocations', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting order before payment:', error);
        throw error;
    }
};

export const getOrganizationSchedulingAvailability = async (payload: any): Promise<any> => {
    
    try {
        const response = await axiosInstance.post('organization/GetOrganizationSchedulingAvailability', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting order before payment:', error);
        throw error;
    }
};

export const getHospitalListByServices = async (payload: any): Promise<any> => {
    
    try {
        const response = await axiosInstance.post('offeredServices/GetHospitalListByServices', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting order before payment:', error);
        throw error;
    }
};

export const getOrganizationByPackage = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('offeredServices/GetOrganizationByPackage', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting order before payment:', error);
        throw error;
    }
};

export const UploadMedicalhistoryReports = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/UploadMedicalhistoryReports', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error uploading medical history reports:', error);
        throw error;
    }
};

export const addBeneficiary = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/AddRefferalPatient', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error uploading medical history reports:', error);
        throw error;
    }
};

export const updateBeneficiaryData = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/UpdateReferralPatient', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error uploading medical history reports:', error);
        throw error;
    }
};

export const deleteBeneficiaryData = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('patients/DeletePatientProfile', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error uploading medical history reports:', error);
        throw error;
    }
};

export const AddUserLocation = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('user/AddUserLocation', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error uploading medical history reports:', error);
        throw error;
    }
};

export const getPatientReminderList = async (payload: any): Promise<any> => {

    try {
        const response = await axiosInstance.post('reminders/GetPatientReminderList', payload);
        return response.data;
    } catch (error: any) {
        console.error('Error uploading medical history reports:', error);
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
    deleteOrderMainBeforePayment,
    getUserSavedAddresses,
    getOrganizationSchedulingAvailability,
    getHospitalListByServices,
    getOrganizationByPackage,
    UploadMedicalhistoryReports,
    addBeneficiary,
    updateBeneficiaryData,
    deleteBeneficiaryData,
    AddUserLocation,
    getPatientReminderList
}; 