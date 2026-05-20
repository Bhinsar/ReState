import React, { useState } from 'react';
import { Search, Filter, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { PropertyType, ListingType } from '@/services/properties/properties.Interface';

interface ExploreFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    minPrice: number | '';
    setMinPrice: (value: number | '') => void;
    maxPrice: number | '';
    setMaxPrice: (value: number | '') => void;
    propertyType: PropertyType | '';
    setPropertyType: (value: PropertyType | '') => void;
    listingType: ListingType | '';
    setListingType: (value: ListingType | '') => void;
    minBedrooms: number | '';
    setMinBedrooms: (value: number | '') => void;
    latitude?: number;
    longitude?: number;
}

export default function ExploreFilters({
    search, setSearch,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    propertyType, setPropertyType,
    listingType, setListingType,
    minBedrooms, setMinBedrooms,
    latitude, longitude
}: ExploreFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <aside className="lg:w-1/4 flex flex-col gap-4">
            {/* Mobile Sticky Search & Filter Bar */}
            <div className="lg:hidden sticky top-0 z-20 bg-slate-50 pt-2 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="City, state, or keywords" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-base"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 flex items-center justify-center rounded-xl border transition-colors shadow-sm ${showFilters ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Filters Box (Hidden on mobile unless toggled) */}
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:sticky lg:top-24 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Filter className="w-5 h-5 text-brand-primary" />
                        Filters
                    </h2>
                    {/* Close button for mobile */}
                    <button onClick={() => setShowFilters(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Search (Desktop only) */}
                    <div className="hidden lg:block">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="City, state, or keywords" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Property Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                        <select 
                            value={propertyType} 
                            onChange={(e) => setPropertyType(e.target.value as any)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white"
                        >
                            <option value="">Any</option>
                            {Object.values(PropertyType).map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Listing Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                        <select 
                            value={listingType} 
                            onChange={(e) => setListingType(e.target.value as any)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white"
                        >
                            <option value="">Any</option>
                            <option value={ListingType.SALE}>For Sale</option>
                            <option value={ListingType.RENT}>For Rent</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price Range</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                                className="w-1/2 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                            />
                            <span className="text-slate-400">-</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                                className="w-1/2 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                            />
                        </div>
                    </div>

                    {/* Bedrooms */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Min Bedrooms</label>
                        <input 
                            type="number" 
                            placeholder="Any" 
                            value={minBedrooms}
                            onChange={(e) => setMinBedrooms(e.target.value ? Number(e.target.value) : '')}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                        />
                    </div>
                    
                    {latitude && longitude && (
                        <div className="bg-brand-primary/10 p-3 rounded-lg flex items-center text-center gap-2 border border-brand-primary/20">
                            <MapPin className="w-5 h-5 text-brand-primary shrink-0" />
                            <p className="text-sm text-brand-secondary/90 leading-tight">Using your location to show nearby properties.</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
