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

export const forgotPassword = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `patients/ForgetpasswordByFilter`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Forgot password failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const verifyOTP = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `patients/VerifyRegisteredUser`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Verify OTP failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const resetPassword = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `patients/ResetPassword`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Reset password failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const signUpStep1 = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `patients/PatientRegistrationStep1`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        throw {
            message: error?.response?.data?.message || 'Sign up failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

export const signUpStep2 = async (credentials: any) => {
    try {
        const response = await axiosInstance.post(
            `patients/PatientRegistrationStep2`,
            credentials
        );
        return response.data;
    } catch (error: any) {
        console.log(error)
        throw {
            message: error?.response?.data?.message || 'Sign up failed',
            status: error?.response?.status,
            code: error?.response?.data?.code
        };
    }
};

// Export all auth related functions
export const authService = {
    login,
    loginWithSocialMedia,
    deleteAccount,
    forgotPassword,
    verifyOTP,
    resetPassword,
    signUpStep1,
    signUpStep2
}; 