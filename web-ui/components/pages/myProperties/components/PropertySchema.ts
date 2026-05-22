import { z } from "zod";
import { PropertyStatus, ListingType, PropertyType } from "@/services/properties/properties.Interface";

export const propertyImageSchema = z.object({
    imageUrl: z.string(),
    isPrimary: z.boolean(),
    sortOrder: z.number().int().min(0, 'Invalid'),
});

export const propertySchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.coerce.number().positive('Price must be a positive number'),
    propertyType: z.nativeEnum(PropertyType, { error: 'Select a property type' }),
    listingType: z.nativeEnum(ListingType, { error: 'Select a listing type' }),
    status: z.nativeEnum(PropertyStatus, { error: 'Select a status' }),
    bedrooms: z.coerce.number().int().min(0, 'Invalid'),
    bathrooms: z.coerce.number().int().min(0, 'Invalid'),
    areaSqft: z.coerce.number().positive('Area must be positive'),
    addressId: z.string().min(1, 'Please select or create an address'),
    images: z.array(propertyImageSchema).min(1, 'Please upload at least one image').max(5, 'You can upload at most 5 images'),
});
