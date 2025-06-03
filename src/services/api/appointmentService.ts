import axiosInstance from '../axios/axiosConfig';

export interface AppointmentListParams {
    UserloginInfoId: string;
    OrderMainStatus: string;
    OrderStatusId: number | null;
    PageNumber: number;
    PageSize: number;
}

export interface Appointment {
    CardNumber: string | null;
    CardType: string;
    CatCategoryId: string;
    CatLevelId: string;
    CatOrderStatusId: string;
    CatSpecialtyId: string;
    Gender: number;
    ImagePath: string;
    OrderDate: string;
    OrderDetailId: string;
    OrderId: string;
    OrganizationId: string;
    OrganizationPlang: string;
    OrganizationSlang: string;
    PatientEmail: string;
    PatientPName: string;
    PatientPhone: string;
    PatientSName: string;
    PatientUserProfileInfoId: string;
    RelationOrderAndOrganizationCategoryId: string;
    SchedulingDate: string;
    SchedulingEndTime: string;
    SchedulingTime: string;
    ServiceCharges: number;
    ServicePrice: number;
    ServiceProviderId: string;
    ServiceProviderPName: string;
    ServiceProviderSName: string;
    Specialties: any[];
    TaskId: string;
    TaxAmt: number;
    TitlePlangCategory: string;
    TitlePlangService: string;
    TitlePlangSpecialty: string | null;
    TitleSlangCategory: string;
    TitleSlangService: string;
    TitleSlangSpecialty: string | null;
    UserLoginInfoId: string;
    UserWalletId: string;
    VideoSDKMeetingId: string;
    VisitMainId: string | null;
}

export interface AppointmentListResponse {
    ResponseStatus: {
        MESSAGE: string;
        STATUSCODE: number;
    };
    TotalRecord: number;
    UserOrders: Appointment[];
}

export const getAppointmentList = async (params: AppointmentListParams): Promise<AppointmentListResponse> => {
    try {
        const response = await axiosInstance.post(
            'user/GetUserOrderListRemoteConsultation',
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

export const appointmentService = {
    getAppointmentList
}; 