import React from 'react';
import { addressResponse } from '@/services/addresses/address.interface';
import { MapPin } from 'lucide-react';

export default function PropertyMap({ address }: { address: addressResponse }) {
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Location</h3>
            <p className="text-slate-600 mb-4 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <span>{address.address}, {address.city}, {address.state} {address.pinCode}</span>
            </p>
            
            {/* Map Placeholder */}
            <div className="w-full h-[400px] bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                <MapPin className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-slate-500 font-medium text-lg">Interactive Map will be integrated here</p>
                <p className="text-sm text-slate-400 mt-2">Lat: {address.latitude}, Lng: {address.longitude}</p>
            </div>
        </div>
    );
}
