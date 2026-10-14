import { create } from 'zustand';
import { authService } from '@/services/api';
import { getStoredToken, setStoredToken, getStoredUser, setStoredUser, clearStoredAuth } from '@/utils/index';

export interface IUser {
    id: string;
    _id?: string;
    numericId: string;
    phoneNumber: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    profilePic?: string;
    isProfileComplete: boolean;
}

interface AuthState {
    token: string | null;
    user: IUser | null;
    isAuthenticated: boolean;
    isProfileComplete: boolean;
    isLoading: boolean;
    error: string | null;
    otpSentPhone: string | null;
    debugOtp: string | null;

    sendOtp: (phoneNumber: string, countryCode?: string) => Promise<boolean>;
    verifyOtp: (otp: string) => Promise<{ success: boolean; isNewUser?: boolean; isProfileComplete?: boolean }>;
    completeProfile: (data: { firstName: string; lastName?: string; userName?: string; bio?: string; profilePic?: string }) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: getStoredToken(),
    user: getStoredUser(),
    isAuthenticated: !!getStoredToken(),
    isProfileComplete: getStoredUser()?.isProfileComplete || false,
    isLoading: false,
    error: null,
    otpSentPhone: null,
    debugOtp: null,

    
    sendOtp: async (phoneNumber: string, countryCode = 'BD') => {
        set({ isLoading: true, error: null });
        try {
            const res = await authService.sendOtp({ phoneNumber, countryCode });
            set({
                isLoading: false,
                otpSentPhone: res.data.phoneNumber,
                debugOtp: res.data.debugOtp || null
            });
            return true;
        } catch (err: any) {
            set({
                isLoading: false,
                error: err.response?.data?.message || 'Failed to send OTP.'
            });
            return false;
        }
    },

    
    verifyOtp: async (otp: string) => {
        const { otpSentPhone } = get();
        if (!otpSentPhone) {
            set({ error: 'Session expired. Please request OTP again.' });
            return { success: false };
        }

        set({ isLoading: true, error: null });
        try {
            const res = await authService.verifyOtp({
                phoneNumber: otpSentPhone,
                otp,
                deviceId: typeof window !== 'undefined' ? window.navigator.userAgent : 'mobile_app'
            });

            const { token, user, isNewUser, isProfileComplete } = res.data;

            setStoredToken(token);
            if (user) setStoredUser(user);

            set({
                token,
                user,
                isAuthenticated: true,
                isProfileComplete: Boolean(isProfileComplete),
                isLoading: false,
                otpSentPhone: null,
                debugOtp: null
            });

            return { success: true, isNewUser, isProfileComplete };
        } catch (err: any) {
            set({
                isLoading: false,
                error: err.response?.data?.message || 'Invalid 6-digit OTP code.'
            });
            return { success: false };
        }
    },

    
    completeProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authService.completeProfile(profileData);
            const updatedUser = res.data.user;

            setStoredUser(updatedUser);
            set({
                user: updatedUser,
                isProfileComplete: true,
                isLoading: false
            });
            return true;
        } catch (err: any) {
            set({
                isLoading: false,
                error: err.response?.data?.message || 'Failed to update profile.'
            });
            return false;
        }
    },

    clearError: () => set({ error: null }),

    logout: () => {
        clearStoredAuth();
        set({
            token: null,
            user: null,
            isAuthenticated: false,
            isProfileComplete: false,
            otpSentPhone: null,
            debugOtp: null,
            error: null
        });
        if (typeof window !== 'undefined') window.location.href = '/';
    }
}));