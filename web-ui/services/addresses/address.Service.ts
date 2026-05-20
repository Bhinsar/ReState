import { api } from "../api";
import { addressApiEndPoints } from "./address.ApiEndPoint";
import { addressCreateRequest, addressResponse } from "./address.interface";

export class AddressService {
    static async getAllAddresses(): Promise<addressResponse[]> {
        try {
            const res = await api.get<addressResponse[]>(addressApiEndPoints.GET_ALL_ADDRESSES);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async getAddressById(id: string): Promise<addressResponse> {
        try {
            const res = await api.get<addressResponse>(addressApiEndPoints.GET_ADDRESS_BY_ID.replace('{id}', id));
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async createAddress(data: addressCreateRequest): Promise<addressResponse> {
        try {
            const res = await api.post<addressResponse>(addressApiEndPoints.CREATE_ADDRESS, data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async updateAddress(id: string, data: addressCreateRequest): Promise<addressResponse> {
        try {
            const res = await api.put<addressResponse>(addressApiEndPoints.UPDATE_ADDRESS.replace('{id}', id), data);
            return res.data;
        } catch (e) {
            throw e;
        }
    }

    static async deleteAddress(id: string): Promise<void> {
        try {
            await api.delete(addressApiEndPoints.DELETE_ADDRESS.replace('{id}', id));
            return;
        } catch (e) {
            throw e;
        }
    }
}