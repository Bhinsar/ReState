import { api } from '@/services/api';
import { userApiEndPoints } from './user.ApiEndPoints';
import { UpdateUserReq, UserRes } from './user.Interface';
import { useAuthStore } from '@/lib/store/authStore';

export class UserService {
    static async getMe(): Promise<UserRes> {
        try {
            const res = await api.get<UserRes>(userApiEndPoints.GET_ME);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async updateMe(data: UpdateUserReq): Promise<UserRes> {
        try {
            const res = await api.put<UserRes>(userApiEndPoints.UPDATE_ME, data);
            // Sync auth store with updated profile data
            const current = useAuthStore.getState().user;
            if (current) {
                useAuthStore.getState().setUser({
                    ...current,
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    avatarUrl: res.data.avatarUrl,
                });
            }
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async deleteMe(): Promise<void> {
        try {
            await api.delete(userApiEndPoints.DELETE_ME);
            // Clear httpOnly cookies that were set by the Next.js server (frontend domain).
            // The Spring Boot backend cannot clear these — only the Next.js server can.
            await fetch("/api/auth/clear-cookies", { method: "POST" });
            useAuthStore.getState().clearUser();
        } catch (e) {
            throw e;
        }
    }

    static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            const res = await api.put(userApiEndPoints.CHANGE_PASSWORD, {
                currentPassword,
                newPassword,
            });
            return res.success;
        } catch (e) {
            throw e;
        }
    }
}