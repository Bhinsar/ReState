'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetProperty } from '@/hooks/useProperty';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import { PropertyType, ListingType } from '@/services/properties/properties.Interface';
import { SlidersHorizontal } from 'lucide-react';
import ExploreFilters from './components/exploreFilters';
import ExploreGrid from './components/exploreGrid';

export default function ExploreView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { latitude, longitude } = useGeolocation();
    
    // Initialize states from URL
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [minPrice, setMinPrice] = useState<number | ''>(searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '');
    const [maxPrice, setMaxPrice] = useState<number | ''>(searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '');
    const [propertyType, setPropertyType] = useState<PropertyType | ''>((searchParams.get('propertyType') as PropertyType) || '');
    const [listingType, setListingType] = useState<ListingType | ''>((searchParams.get('listingType') as ListingType) || '');
    const [minBedrooms, setMinBedrooms] = useState<number | ''>(searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : '');
    
    const debouncedSearch = useDebounce(search, 500);
    const debouncedMinPrice = useDebounce(minPrice, 500);
    const debouncedMaxPrice = useDebounce(maxPrice, 500);
    const debouncedMinBedrooms = useDebounce(minBedrooms, 500);

    // Sync state to URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (debouncedSearch) params.set('search', debouncedSearch);
        else params.delete('search');

        if (debouncedMinPrice) params.set('minPrice', debouncedMinPrice.toString());
        else params.delete('minPrice');

        if (debouncedMaxPrice) params.set('maxPrice', debouncedMaxPrice.toString());
        else params.delete('maxPrice');

        if (propertyType) params.set('propertyType', propertyType);
        else params.delete('propertyType');

        if (listingType) params.set('listingType', listingType);
        else params.delete('listingType');

        if (debouncedMinBedrooms) params.set('minBedrooms', debouncedMinBedrooms.toString());
        else params.delete('minBedrooms');

        const newQueryString = params.toString();
        if (newQueryString !== searchParams.toString()) {
            router.replace(`${pathname}?${newQueryString}`, { scroll: false });
        }
    }, [debouncedSearch, debouncedMinPrice, debouncedMaxPrice, propertyType, listingType, debouncedMinBedrooms, pathname, router, searchParams]);

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetProperty({
        size: 10,
        search: debouncedSearch || undefined,
        minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
        propertyType: propertyType as PropertyType || undefined,
        listingType: listingType as ListingType || undefined,
        minBedrooms: debouncedMinBedrooms ? Number(debouncedMinBedrooms) : undefined,
        latitude,
        longitude
    });

    return (
        <div className="bg-slate-50 min-h-screen py-8">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Explore Properties</h1>
                    <p className="text-slate-500">Find your dream property from our extensive collection.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <ExploreFilters 
                        search={search} setSearch={setSearch}
                        minPrice={minPrice} setMinPrice={setMinPrice}
                        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                        propertyType={propertyType} setPropertyType={setPropertyType}
                        listingType={listingType} setListingType={setListingType}
                        minBedrooms={minBedrooms} setMinBedrooms={setMinBedrooms}
                        latitude={latitude} longitude={longitude}
                    />

                    {/* Main Content */}
                    <main className="lg:w-3/4">
                        <ExploreGrid 
                            isLoading={isLoading}
                            error={error}
                            data={data}
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            fetchNextPage={fetchNextPage}
                        />
                    </main>
                </div>
            </div>
        </div>
    )
}