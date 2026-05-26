import React from 'react';
import { ownerResponse } from '@/services/properties/properties.Interface';
import { Mail, User } from 'lucide-react';
import Image from 'next/image';
import { useInterestedProperty } from '@/hooks/useProperty';

export default function PropertyAgent({ owner, isOwer, propertyId, isInterested }: { owner: ownerResponse, isOwer: boolean, propertyId: string, isInterested: boolean }) {
    const { mutate: expressInterest, isPending } = useInterestedProperty();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24 ">
            {/* <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Agent</h3> */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-brand-primary/20 shrink-0">
                    {owner.avatarUrl ? (
                        <Image src={owner.avatarUrl} alt={owner.firstName} fill className="object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-lg">{owner.firstName} {owner.lastName}</p>
                    {/* <p className="text-sm text-brand-secondary font-medium">Listing Agent</p> */}
                </div>
            </div>

            <div className="space-y-4">
                {/* <a href={`tel:${owner.phoneNumber}`} className="flex items-center justify-center gap-2 w-full py-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-secondary rounded-xl font-semibold transition-colors">
                    <Phone className="w-5 h-5" />
                    {owner.phoneNumber}
                </a> */}
                <button 
                    disabled={isOwer || isInterested || isPending} 
                    onClick={() => expressInterest(propertyId)} 
                    className={`${isOwer || isInterested || isPending ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center gap-2 w-full py-3 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl font-semibold transition-colors cursor-pointer`}
                >
                    <Mail className="w-5 h-5" />
                    {isInterested ? 'Interested' : isPending ? 'Submitting...' : "I'm Interested"}
                </button>
            </div>
        </div>
    );
}

