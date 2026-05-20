import { authResponse, loginParams, registerUserParams, resetPasswordParams, signUpParams } from "@/services/auth/auth.Interface";
import { authApiEndPont } from "@/services/auth/auth.ApiEndponts";
import { api } from '@/services/api'
import { useAuthStore } from "@/lib/store/authStore";

export class AuthService {
    static async login(data: loginParams): Promise<authResponse> {
        try {
            const res = await api.post<authResponse>(authApiEndPont.login, data)
            useAuthStore.getState().setUser(res.data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async signUp(data: signUpParams): Promise<authResponse> {
        try {
            const res = await api.post<authResponse>(authApiEndPont.register, data)
            useAuthStore.getState().setUser(res.data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async resendOtp(): Promise<boolean> {
        try {
            const res = await api.post(authApiEndPont.resendOtp)
            return res.success;

        } catch (e) {
            return false;
        }
    }

    static async verifyOtp(otp: string): Promise<authResponse> {
        const data = {
            otp: otp
        };
        try {
            const res = await api.post<authResponse>(authApiEndPont.verifyOTP, data);
            useAuthStore.getState().setUser(res.data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async logout(): Promise<void> {
        try {
            await api.post(authApiEndPont.logout)
            useAuthStore.getState().clearUser();
        } catch (e) {
            throw e
        }
    }

    static async registerUser(data: registerUserParams): Promise<authResponse> {
        try {
            const res = await api.post<authResponse>(authApiEndPont.registerUser, data);
            useAuthStore.getState().setUser(res.data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async forgotPassword(email: string): Promise<boolean> {
        try {
            const res = await api.post(authApiEndPont.forgotPassword, { email });
            return res.success;
        } catch (e) {
            throw e;
        }
    }

    static async resetPassword(data: resetPasswordParams): Promise<boolean> {
        try {
            const res = await api.post(authApiEndPont.resetPassword, data);
            return res.success;
        } catch (e) {
            throw e;
        }
    }

    static async resetPasswordLink(token: string): Promise<boolean> {
        try {
            const res = await api.post(authApiEndPont.resetPasswordLink, { token });
            return res.success;
        } catch (e) {
            throw e;
        }
    }
}