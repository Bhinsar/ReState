import {authResponse, loginParams, signUpParams} from "@/services/auth/auth.Interface";
import {ApiEndPont} from "@/services/auth/apiEndponts";
import {api} from '@/services/api'

export class AuthService{
    static async login(data: loginParams){
        try {
            const res = await api.post<authResponse>(ApiEndPont.login,data)
            return res.data;
        }catch(e){
            throw e;
        }
    }

    static async signUp(data: signUpParams){
        try {
            const res = await api.post<authResponse>(ApiEndPont.register,data)
            return res.data;
        }catch(e){
            throw e;
        }
    }
}