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