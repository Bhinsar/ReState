import {authResponse, loginParams, registerUserParams, signUpParams} from "@/services/auth/auth.Interface";
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

    static async verifyOtp(otp: string): Promise<authResponse> {
        const data = {
            otp: otp
        };
        try {
            const res = await api.post<authResponse>(ApiEndPont.verifyOTP, data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async logout(): Promise<void> {
        try{
            await api.post(ApiEndPont.logout)
        }catch (e){
            throw e
        }
    }

    static async registerUser(data: registerUserParams): Promise<authResponse> {
        try {
            const res = await api.post<authResponse>(ApiEndPont.registerUser, data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }
}