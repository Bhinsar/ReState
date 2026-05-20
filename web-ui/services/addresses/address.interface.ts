export interface addressResponse {
    addressId: string;
    address: string;
    plotNumber?: string;
    floor?: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    latitude: number;
    longitude: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface addressCreateRequest {
    address: string;
    plotNumber?: string;
    floor?: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    latitude: number;
    longitude: number;
}