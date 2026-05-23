'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Edit3, BadgeCheck, Clock } from 'lucide-react';
import { UserRes } from '@/services/users/user.Interface';
import { getInitials, formatDate } from './shared';

interface ProfileHeroProps {
    profile: UserRes;
    isUploadingAvatar: boolean;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // onEditClick: () => void;
}

export default function ProfileHero({
    profile,
    isUploadingAvatar,
    onAvatarChange,
    // onEditClick,
}: ProfileHeroProps) {
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const displayName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    const initials = getInitials(profile.firstName, profile.lastName);

    return (
        <div className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
                <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/5" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white/30 overflow-hidden shadow-2xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                            {profile.avatarUrl ? (
                                <Image
                                    src={profile.avatarUrl}
                                    alt={displayName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-white">{initials}</span>
                            )}
                        </div>

                        {/* Camera button */}
                        <button
                            id="avatar-upload-btn"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white text-blue-600 shadow-lg
                                       flex items-center justify-center hover:bg-blue-50 transition-all active:scale-95
                                       disabled:opacity-70 cursor-pointer"
                        >
                            {isUploadingAvatar
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Camera className="w-4 h-4" />
                            }
                        </button>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onAvatarChange}
                        />
                    </div>

                    {/* Name & meta */}
                    <div className="flex-1 text-center sm:text-left pb-1">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                {displayName || 'Your Profile'}
                            </h1>
                            {profile.registerStep === 'REGISTERED' && (
                                <BadgeCheck className="w-6 h-6 text-blue-200 shrink-0" />
                            )}
                        </div>
                        <p className="text-blue-200 text-sm mt-1">{profile.email}</p>
                        <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                            <Clock className="w-3.5 h-3.5 text-blue-300" />
                            <span className="text-blue-300 text-xs">
                                Member since {formatDate(profile.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Edit button
                    <div className="flex items-center gap-2 pb-1">
                        <button
                            id="edit-profile-btn"
                            onClick={onEditClick}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25
                                       text-white text-sm font-semibold transition-all active:scale-95 backdrop-blur-sm"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
