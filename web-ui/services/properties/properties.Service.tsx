import {PropertyFilterRequest, PropertySummaryResponse, PropertyResponse, PropertyUpdate} from "@/services/properties/properties.Interface";
import {api, ApiResponse} from "@/services/api";
import {propertyApiEndPoints} from "@/services/properties/property.ApiEndPoints";

export class PropertyService {
    static async getAllProperties(filter: PropertyFilterRequest): Promise<ApiResponse<PropertySummaryResponse[]>> {
        try {
            const res = await api.get<PropertySummaryResponse[]>(`${propertyApiEndPoints.GET_ALL_PROPERTIES}`,{
                params: { ...filter }
            });
            return res;
        } catch (e) {
            throw e;
        }
    }

    static async getTrendingProperties(filter: PropertyFilterRequest): Promise<ApiResponse<PropertySummaryResponse[]>> {
        try {
            const res = await api.get<PropertySummaryResponse[]>(`${propertyApiEndPoints.GET_TRENDING_PROPERTIES}`,{
                params: { ...filter }
            });
            return res;
        } catch (e) {
            throw e;
        }
    }
    static async getPropertyById(propertyId: string): Promise<PropertyResponse> {
        try {
            const res = await api.get<PropertyResponse>(`${propertyApiEndPoints.GET_PROPERTY_BY_ID}/${propertyId}`);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async getOwnerProperties(filter: PropertyFilterRequest): Promise<ApiResponse<PropertySummaryResponse[]>> {
        try {
            const res = await api.get<PropertySummaryResponse[]>(`${propertyApiEndPoints.GET_PROPERTIES_BY_USER}`, {
                params: { ...filter }
            });
            return res;
        } catch (e) {
            throw e;
        }
    }
    
    static async deleteProperty(propertyId: string): Promise<void> {
        try {
            await api.delete(`${propertyApiEndPoints.DELETE_PROPERTY}/${propertyId}`);
        } catch (e) {
            throw e;
        }
    }
    static async updateProperty(propertyId: string, data: PropertyUpdate): Promise<PropertyResponse> {
        try {
            const res = await api.put<PropertyResponse>(`${propertyApiEndPoints.UPDATE_PROPERTY}/${propertyId}`, data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }
    static async createProperty(data: PropertyUpdate): Promise<PropertyResponse> {
        try {
            const res = await api.post<PropertyResponse>(`${propertyApiEndPoints.CREATE_PROPERTY}`, data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }
}