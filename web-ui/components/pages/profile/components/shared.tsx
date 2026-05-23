'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

// ─── Re-export schemas & types from dedicated schema file ─────────────────────
export type { ProfileForm, PasswordForm } from './profile.schema';

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatDate(dateStr?: Date | string): string {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch {
        return String(dateStr);
    }
}

export function getInitials(firstName?: string, lastName?: string): string {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
export function SectionCard({
    title, icon, children, className = '',
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden', className)}>
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    {icon}
                </div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────
export function FieldRow({ label, value, icon }: {
    label: string; value: string; icon: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-4 py-3.5 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium text-slate-800 truncate">{value || '—'}</p>
            </div>
        </div>
    );
}

// ─── InputField ───────────────────────────────────────────────────────────────
export function InputField({
    label, error, ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
            <input
                {...props}
                className={cn(
                    'h-11 px-4 rounded-xl border-2 text-sm font-medium text-slate-800 bg-white transition-all',
                    'outline-none focus:ring-0 placeholder:text-slate-300',
                    error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500',
                    props.disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
                    props.className,
                )}
            />
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
    );
}

// ─── PasswordField ────────────────────────────────────────────────────────────
export function PasswordField({
    label, error, ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    const [show, setShow] = useState(false);
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
            <div className="relative">
                <input
                    {...props}
                    type={show ? 'text' : 'password'}
                    className={cn(
                        'h-11 pl-4 pr-12 w-full rounded-xl border-2 text-sm font-medium text-slate-800 bg-white transition-all',
                        'outline-none focus:ring-0 placeholder:text-slate-300',
                        error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500',
                        props.disabled && 'opacity-50 cursor-not-allowed',
                    )}
                />
                <button
                    type="button"
                    onClick={() => setShow((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
    );
}
