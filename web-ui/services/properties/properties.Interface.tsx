import { addressResponse as PropertyAddressResponse } from "../addresses/address.interface";

export enum PropertyType {
    COMMERCIAL = 'COMMERCIAL',
    PLOT = 'PLOT',
    VILLA = 'VILLA',
    APARTMENT = 'APARTMENT',
    HOUSE = 'HOUSE',
    CONDO = 'CONDO',
}

export enum ListingType {
    RENT = 'RENT',
    SALE = 'SALE',
}

export enum PropertyStatus {
    DRAFT = 'DRAFT',
    AVAILABLE = 'AVAILABLE',
    PENDING = 'PENDING',
    SOLD = 'SOLD',
    RENTED = 'RENTED',
}

export interface PropertySummaryResponse {
    propertyId: string;
    title: string;
    price: number;
    propertyType: PropertyType;
    listingType: ListingType;
    status: PropertyStatus;
    areaSqft: number;
    bathrooms: number;
    bedrooms: number;
    primaryImageUrl: string;
    createdAt: string;
    city: string;
    state: string;
}

export interface PropertyFilterRequest {
    size: number;
    page: number;
    city?: string;
    state?: string;
    propertyType?: PropertyType;
    listingType?: ListingType;
    propertyStatus?: PropertyStatus;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    minBathrooms?: number;
    search?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
}

export interface ownerResponse {
    id: string
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    avatarUrl: string
}


export interface PropertyImageResponse {
    imageId: string;
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface PropertyResponse {
    propertyId: string;
    title: string;
    description: string;
    price: number;
    propertyType: PropertyType;
    listingType: ListingType;
    status: PropertyStatus;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    createdAt: string;
    updatedAt: string;
    owner: ownerResponse
    address: PropertyAddressResponse
    images: PropertyImageResponse[];
    viewCount: number;
}

export interface PropertyImageRequest {
    imageId?: string;
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface PropertyUpdate {
    title:string;
    description:string;
    price:number;
    propertyType:PropertyType;
    listingType:ListingType;
    status:PropertyStatus;
    bedrooms:number;
    bathrooms:number;
    areaSqft:number;
    addressId:string;
    images:PropertyImageRequest[];
}