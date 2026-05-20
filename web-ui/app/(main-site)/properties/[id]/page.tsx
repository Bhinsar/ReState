import { Metadata, ResolvingMetadata } from 'next'
import React from 'react'
import PropertyDetailView from '@/components/pages/propertyDetail/propertyDetailView';
import { PropertyService } from '@/services/properties/properties.Service';

interface PageProps {
    params: Promise<{ id: string }> | { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params; 
    
    try {
        const response = await PropertyService.getPropertyById(resolvedParams.id);
        const property = response;
        
        if (!property) return { title: "Property Not Found | ReState" };

        const primaryImage = property.images?.find(img => img.isPrimary)?.imageUrl || property.images?.[0]?.imageUrl;

        return {
            title: `${property.title} | ReState`,
            description: property.description,
            openGraph: {
                title: property.title,
                description: property.description,
                images: primaryImage ? [primaryImage] : [],
            }
        }
    } catch (error) {
        return {
            title: "Property | ReState",
            description: "View property details on ReState."
        }
    }
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    
    return (
        <PropertyDetailView id={resolvedParams.id} />
    )
}