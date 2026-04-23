import {authResponse, loginParams, signUpParams} from "@/services/auth/auth.Interface";
import {ApiEndPont} from "@/services/auth/apiEndponts";
import {api} from '@/services/api'

export class AuthService {
    static async login(data: loginParams): Promise<authResponse> {
        try {
            const res = await api.post<authResponse>(ApiEndPont.login, data)
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async signUp(data: signUpParams): Promise<authResponse> {
        try {
            const res = await api.post<authResponse>(ApiEndPont.register, data)
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async resendOtp(): Promise<boolean> {
        try {
            const res = await api.post(ApiEndPont.resendOtp)
            return res.success;

        } catch (e) {
            return false;
        }
    }

    static async verifyOtp(otp: string) {
        const data = {
            otp: otp
        };

        const res = await api.post(ApiEndPont.verifyOTP, data);
        return res.data;
    }
}