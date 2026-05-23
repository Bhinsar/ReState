'use client';

import React from 'react';
import { Control } from 'react-hook-form';
import { Lock, ChevronRight, CheckCircle2, Loader2, X } from 'lucide-react';
import FormInput from '@/components/common/fromInput';
import { PasswordForm, SectionCard } from './shared';

interface SecuritySectionProps {
    isChangingPassword: boolean;
    isSaving: boolean;
    control: Control<PasswordForm>;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onOpen: () => void;
    onCancel: () => void;
}

export default function SecuritySection({
    isChangingPassword,
    isSaving,
    control,
    onSubmit,
    onOpen,
    onCancel,
}: SecuritySectionProps) {
    return (
        <SectionCard title="Security" icon={<Lock className="w-4 h-4" />}>
            {!isChangingPassword ? (
                /* Collapsed — clickable row */
                <button
                    id="change-password-btn"
                    onClick={onOpen}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50
                               hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Lock className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold">Change Password</p>
                            <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
            ) : (
                /* Expanded form */
                <form onSubmit={onSubmit} className="space-y-4">
                    <FormInput
                        name="currentPassword"
                        control={control}
                        label="Current Password"
                        placeholder="Enter current password"
                        isPassword
                    />
                    <FormInput
                        name="newPassword"
                        control={control}
                        label="New Password"
                        placeholder="Min. 8 characters"
                        isPassword
                    />
                    <FormInput
                        name="confirmPassword"
                        control={control}
                        label="Confirm New Password"
                        placeholder="Repeat new password"
                        isPassword
                    />

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="flex-1 h-11 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700
                                       hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                            id="save-password-btn"
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 h-11 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold
                                       shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95
                                       disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isSaving
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCircle2 className="w-4 h-4" />
                            }
                            {isSaving ? 'Updating…' : 'Update Password'}
                        </button>
                    </div>
                </form>
            )}
        </SectionCard>
    );
}
