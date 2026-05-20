import {PropertyFilterRequest, PropertySummaryResponse, PropertyResponse} from "@/services/properties/properties.Interface";
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
}