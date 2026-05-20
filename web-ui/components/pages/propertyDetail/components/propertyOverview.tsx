import React from 'react';
import { PropertyResponse } from '@/services/properties/properties.Interface';
import { Bed, Bath, Maximize, Home } from 'lucide-react';

export default function PropertyOverview({ property }: { property: PropertyResponse }) {
    const features = [
        { icon: Bed, label: 'Bedrooms', value: property.bedrooms },
        { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
        { icon: Maximize, label: 'Square Feet', value: property.areaSqft },
        { icon: Home, label: 'Property Type', value: property.propertyType },
    ];

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Property Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-secondary shrink-0">
                            <feat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{feat.label}</p>
                            <p className="text-lg font-bold text-slate-900">{feat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <hr className="border-slate-100 mb-8" />
            
            <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
            </div>
        </div>
    );
}
