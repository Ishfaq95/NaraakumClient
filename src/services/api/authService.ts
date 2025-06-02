import axiosInstance from '../axios/axiosConfig';

const BASE_PATH = '/auth';

/**
 * Authenticate user with email and password
 * @param credentials object containing email and password
 */
export const login = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `User/AuthenticateUserbyFIlter`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log('error', error);
        throw {
            message: error?.response?.data?.message || 'Login failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

// Export all auth related functions
export const authService = {
    login
}; 