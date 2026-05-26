import { api, ApiResponse } from "../api";
import { NOTIFICATION_ENDPOINTS } from "./notification.ApiEndpoints";
import { NotificationResponse } from "./notification.Interface";

export class NotificationService {
    static async getAllNotifications(): Promise<ApiResponse<NotificationResponse[]>> {
        try {
            const res = await api.get<NotificationResponse[]>(NOTIFICATION_ENDPOINTS.GET_ALL)
            return res;
        } catch (error) {
            throw error;
        }   
    }   

    static async readAllNotifications(): Promise<boolean> {
        try {
            const res = await api.patch(NOTIFICATION_ENDPOINTS.READ_ALL)
            return res.success;
        } catch (error) {
            throw error;
        }
    }   

    static async readNotification(id: string): Promise<boolean> {
        try {
            const res = await api.patch(NOTIFICATION_ENDPOINTS.READ_ONE(id))
            return res.success;
        } catch (error) {
            throw error;
        }
    }   

    static async unreadCount(): Promise<number> {
        try {
            const res = await api.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT)
            return res.data;
        } catch (error) {
            throw error;
        }
    }   

}
