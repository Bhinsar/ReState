'use client';

import React from 'react';
import { Control } from 'react-hook-form';
import { User, Mail, Phone, Calendar, Shield, Edit3, Save, X, Loader2 } from 'lucide-react';
import FormInput from '@/components/common/fromInput';
import { UserRes } from '@/services/users/user.Interface';
import { ProfileForm, SectionCard, FieldRow, formatDate } from './shared';

// ─── View Mode ────────────────────────────────────────────────────────────────
interface PersonalInfoViewProps {
    profile: UserRes;
    onEditClick: () => void;
}

function PersonalInfoView({ profile, onEditClick }: PersonalInfoViewProps) {
    return (
        <SectionCard title="Personal Information" icon={<User className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <FieldRow label="First Name"    value={profile.firstName ?? ''}  icon={<User className="w-4 h-4" />} />
                <FieldRow label="Last Name"     value={profile.lastName ?? ''}   icon={<User className="w-4 h-4" />} />
                <FieldRow label="Email Address" value={profile.email ?? ''}      icon={<Mail className="w-4 h-4" />} />
                <FieldRow
                    label="Phone Number"
                    value={profile.phoneNumber ? `${profile.countryCode} ${profile.phoneNumber}` : ''}
                    icon={<Phone className="w-4 h-4" />}
                />
                <FieldRow
                    label="Date of Birth"
                    value={formatDate(profile.dateOfBirth)}
                    icon={<Calendar className="w-4 h-4" />}
                />
                <FieldRow
                    label="Account Status"
                    value={profile.registerStep?.replace(/_/g, ' ') ?? ''}
                    icon={<Shield className="w-4 h-4" />}
                />
            </div>
            <button
                id="edit-profile-inline-btn"
                onClick={onEditClick}
                className="cursor-pointer mt-4 w-full h-10 rounded-xl border-2 border-dashed border-slate-200 text-sm font-medium
                           text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
                <span className="flex items-center justify-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit personal information
                </span>
            </button>
        </SectionCard>
    );
}

// ─── Edit Mode ────────────────────────────────────────────────────────────────
interface PersonalInfoEditProps {
    control: Control<ProfileForm>;
    isSaving: boolean;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onCancel: () => void;
}

function PersonalInfoEdit({ control, isSaving, onSubmit, onCancel }: PersonalInfoEditProps) {
    return (
        <SectionCard title="Edit Profile" icon={<Edit3 className="w-4 h-4" />}>
            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                        name="firstName"
                        control={control}
                        label="First Name"
                        placeholder="John"
                        startIcon={<User />}
                    />
                    <FormInput
                        name="lastName"
                        control={control}
                        label="Last Name"
                        placeholder="Doe"
                        startIcon={<User />}
                    />
                    <FormInput
                        name="countryCode"
                        control={control}
                        label="Country Code"
                        placeholder="+1"
                        startIcon={<Phone />}
                    />
                    <FormInput
                        name="phoneNumber"
                        control={control}
                        label="Phone Number"
                        placeholder="1234567890"
                        startIcon={<Phone />}
                    />
                    <FormInput
                        name="dateOfBirth"
                        control={control}
                        label="Date of Birth"
                        type="date"
                        startIcon={<Calendar />}
                        maxValue={new Date().toISOString().split('T')[0]}
                        style="sm:col-span-2"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="cursor-pointer flex-1 h-11 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700
                                   hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                        id="save-profile-btn"
                        type="submit"
                        disabled={isSaving}
                        className="cursor-pointer flex-1 h-11 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold
                                   shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95
                                   disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </SectionCard>
    );
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────
interface PersonalInfoProps {
    profile: UserRes;
    isEditing: boolean;
    control: Control<ProfileForm>;
    isSaving: boolean;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onEditClick: () => void;
    onCancel: () => void;
}

export default function PersonalInfo(props: PersonalInfoProps) {
    if (props.isEditing) {
        return (
            <PersonalInfoEdit
                control={props.control}
                isSaving={props.isSaving}
                onSubmit={props.onSubmit}
                onCancel={props.onCancel}
            />
        );
    }
    return <PersonalInfoView profile={props.profile} onEditClick={props.onEditClick} />;
}
