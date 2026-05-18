import {PropertySummaryResponse} from "@/services/properties/properties.Interface";
import {api, ApiResponse} from "@/services/api";
import {propertyApiEndPoints} from "@/services/properties/property.ApiEndPoints";

export class PropertyService {
    static async getAllProperties(page: number,size:number): Promise<ApiResponse<PropertySummaryResponse[]>> {
        try {
            const res = await api.get<PropertySummaryResponse[]>(`${propertyApiEndPoints.GET_ALL_PROPERTIES}`,{
                params:{
                    page,
                    size
                }
            });
            return res;
        } catch (e) {
            throw e;
        }
    }

    static async getTrendingProperties(page: number,size:number): Promise<ApiResponse<PropertySummaryResponse[]>> {
        try {
            const res = await api.get<PropertySummaryResponse[]>(`${propertyApiEndPoints.GET_TRENDING_PROPERTIES}`,{
                params:{
                    page,
                    size
                }
            });
            return res;
        } catch (e) {
            throw e;
        }
    }
}