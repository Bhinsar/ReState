import React from 'react';
import { PropertyResponse } from '@/services/properties/properties.Interface';
import { MapPin } from 'lucide-react';

export default function PropertyHeader({ property }: { property: PropertyResponse }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-brand-primary/20 text-brand-secondary rounded-full text-sm font-semibold tracking-wide uppercase">
                        {property.listingType}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase ${
                        property.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                        {property.status}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{property.title}</h1>
                <p className="flex items-center text-slate-500 text-lg">
                    <MapPin className="w-5 h-5 mr-1.5 text-brand-primary" />
                    {property.address.city}, {property.address.state}, {property.address.country}
                </p>
            </div>
            <div className="text-left md:text-right">
                <p className="text-sm text-slate-500 font-medium mb-1">Asking Price</p>
                <h2 className="text-4xl font-bold text-brand-secondary">Rs. {property.price.toLocaleString()}</h2>
            </div>
        </div>
    );
}
