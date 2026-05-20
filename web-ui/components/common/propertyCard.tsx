import React from 'react';
import Image from 'next/image';
import { PropertySummaryResponse, ListingType, PropertyStatus } from '@/services/properties/properties.Interface';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PropertyCardProps {
    property: PropertySummaryResponse;
}

const getStatusColor = (status: PropertyStatus | string) => {
    switch (status) {
        case 'AVAILABLE': return 'bg-green-500/90 text-white';
        case 'SOLD': return 'bg-red-500/90 text-white';
        case 'PENDING': return 'bg-yellow-500/90 text-white';
        case 'RENTED': return 'bg-purple-500/90 text-white';
        case 'DRAFT': return 'bg-slate-500/90 text-white';
        default: return 'bg-white/90 text-slate-800';
    }
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }: { property: PropertySummaryResponse }) => {
    const router = useRouter();
    const {
        propertyId,
        primaryImageUrl,
        title,
        price,
        propertyType,
        listingType,
        status,
        areaSqft,
        bathrooms,
        bedrooms,
        city,
        state,
    } = property;

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);

    const statusClass = getStatusColor(status);

    return (
        <div onClick={() => router.push(`/properties/${propertyId}`)} className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] cursor-pointer flex flex-col relative border border-black/5 font-sans group hover:-translate-y-1.5">
            <div className="relative w-full h-[220px] overflow-hidden">
                {primaryImageUrl ? (
                    <Image
                        src={primaryImageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading='lazy'
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#f5f7fa] to-[#c3cfe2]" />
                )}
                
                <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:-translate-y-0.5 bg-white/85 text-slate-900 border border-white/50">
                        {listingType === ListingType.RENT ? 'For Rent' : 'For Sale'}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:-translate-y-0.5 bg-slate-900/70 text-white border border-white/20">
                        {propertyType.replace('_', ' ')}
                    </span>
                </div>
                
                <div className="absolute bottom-3 left-3 z-10">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:-translate-y-0.5 border border-white/20 ${statusClass}`}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-3">
                <div className="flex items-baseline">
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{formattedPrice}</span>
                    {listingType === ListingType.RENT && <span className="text-sm text-slate-500 ml-1 font-medium">/mo</span>}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800 m-0 whitespace-nowrap overflow-hidden text-ellipsis leading-snug" title={title}>{title}</h3>
                
                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                    <MapPin size={16} className="text-blue-500" />
                    <span>{city}, {state}</span>
                </div>
                
                <div className="h-px bg-slate-100 my-2 w-full" />
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold">
                        <Bed size={18} className="text-slate-400" />
                        <span>{bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold">
                        <Bath size={18} className="text-slate-400" />
                        <span>{bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold">
                        <Maximize size={18} className="text-slate-400" />
                        <span>{areaSqft} sqft</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
