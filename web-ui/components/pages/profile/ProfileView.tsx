'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { profileSchema, passwordSchema, ProfileForm, PasswordForm } from './components/profile.schema';
import ProfileHero from './components/ProfileHero';
import PersonalInfo from './components/PersonalInfo';
import SecuritySection from './components/SecuritySection';
import AccountActions from './components/AccountActions';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth/auth.Service';
import { toast } from 'sonner';
import {
    useGetMe,
    useUpdateMe,
    useUploadAvatar,
    useChangePassword,
    useDeleteMe,
} from '@/hooks/useUser';

export default function ProfileView() {
    const router = useRouter();

    // ── Server state (via React Query) ────────────────────────────────────────
    const { data: profile, isLoading, isError, refetch } = useGetMe();
    const updateMe = useUpdateMe();
    const uploadAvatar = useUploadAvatar();
    const changePassword = useChangePassword();
    const deleteMe = useDeleteMe();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [isEditingProfile, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChanging] = useState(false);

    // ── Forms ─────────────────────────────────────────────────────────────────
    const profileForm  = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
    const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

    function populateProfileForm(data: NonNullable<typeof profile>) {
        const dob = data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().split('T')[0]
            : '';
        profileForm.reset({
            firstName:   data.firstName,
            lastName:    data.lastName,
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
            dateOfBirth: dob,
        });
    }

    // ── Handlers ──────────────────────────────────────────────────────────────
    const onSaveProfile = async (values: ProfileForm) => {
        await updateMe.mutateAsync({
            ...values,
            dateOfBirth: new Date(values.dateOfBirth),
            avatarUrl:   profile?.avatarUrl ?? '',
        });
        setIsEditing(false);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        if (file.size > 5 * 1024 * 1024)    { toast.error('Image must be smaller than 5 MB'); return; }
        if (!profile) return;
        await uploadAvatar.mutateAsync({ file, profile });
        e.target.value = '';
    };

    const onChangePassword = async (values: PasswordForm) => {
        await changePassword.mutateAsync({
            currentPassword: values.currentPassword,
            newPassword:     values.newPassword,
        });
        setIsChanging(false);
        passwordForm.reset();
    };

    const handleDeleteAccount = async () => {
        await deleteMe.mutateAsync();
        router.replace('/');
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            router.replace('/');
        } catch {
            toast.error('Logout failed');
        }
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-52 animate-pulse" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-64 animate-pulse" />
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm h-64 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (isError || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Failed to load profile</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Something went wrong while fetching your profile. Please check your connection and try again.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            id="retry-load-btn"
                            onClick={() => refetch()}
                            className="cursor-pointer flex-1 flex items-center justify-center gap-2 h-11 rounded-xl
                                       bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                                       transition-all active:scale-95 shadow-md shadow-blue-200"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try again
                        </button>
                        <button
                            id="go-home-btn"
                            onClick={() => router.push('/')}
                            className="cursor-pointer flex-1 flex items-center justify-center gap-2 h-11 rounded-xl
                                       border-2 border-slate-200 text-slate-700 text-sm font-semibold
                                       hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <Home className="w-4 h-4" />
                            Go home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Page ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-10">

            <ProfileHero
                profile={profile}
                isUploadingAvatar={uploadAvatar.isPending}
                onAvatarChange={handleAvatarChange}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 space-y-5">

                <PersonalInfo
                    profile={profile}
                    isEditing={isEditingProfile}
                    control={profileForm.control}
                    isSaving={updateMe.isPending}
                    onSubmit={profileForm.handleSubmit(onSaveProfile)}
                    onEditClick={() => { setIsEditing(true); populateProfileForm(profile); }}
                    onCancel={() => { setIsEditing(false); populateProfileForm(profile); }}
                />

                <SecuritySection
                    isChangingPassword={isChangingPassword}
                    isSaving={changePassword.isPending}
                    control={passwordForm.control}
                    onSubmit={passwordForm.handleSubmit(onChangePassword)}
                    onOpen={() => setIsChanging(true)}
                    onCancel={() => { setIsChanging(false); passwordForm.reset(); }}
                />

                <AccountActions
                    onLogout={handleLogout}
                    isDeleting={deleteMe.isPending}
                    onDeleteConfirm={handleDeleteAccount}
                />
            </div>
        </div>
    );
}
