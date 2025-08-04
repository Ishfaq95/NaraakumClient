import axiosInstance from '../axios/axiosConfig';

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
        throw {
            message: error?.response?.data?.message || 'Login failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

/**
 * Authenticate user with Google credentials
 * @param googleUser object containing Google user data
 */
export const loginWithSocialMedia = async (googleUser: any) => {
    try {
        const response = await axiosInstance.post(
            `patients/RegisterPatientbySocialmedia`,
            googleUser
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Google login failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const deleteAccount = async (credentials: any) => {
  try {
    const response = await axiosInstance.post(
      `user/AuthenticatedUserDeleteAccount`,
      credentials
    );
    return response.data;
  } catch (error: any) {
    throw {
      message: error?.response?.data?.message || 'Delete account failed',
      status: error?.response?.status,
      code: error?.response?.data?.code
    };
  }
};

// Export all auth related functions
export const authService = {
    login,
    loginWithSocialMedia,
    deleteAccount
}; 