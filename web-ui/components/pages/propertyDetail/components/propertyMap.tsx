import React from 'react';
import { addressResponse } from '@/services/addresses/address.interface';
import { MapPin } from 'lucide-react';
import Map from '@/components/common/map';

export default function PropertyMap({ address }: { address: addressResponse }) {
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Location</h3>
            <p className="text-slate-600 mb-4 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <span>{address.address}, {address.city}, {address.state} {address.pinCode}</span>
            </p>
            
            {/* Map Placeholder */}
            <div className="w-full h-100 bg-slate-50 rounded-xl flex flex-col items-center justify-center">
                <Map lat={address.latitude} lng={address.longitude} readOnly={true} showDirections={true} />
            </div>
        </div>
    );
}
