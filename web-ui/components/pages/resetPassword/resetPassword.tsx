"use client"
import ErrorMessage from '@/components/common/errorMessage';
import SubmitButton from '@/components/common/submitButton';
import Title from '@/components/common/title'
import FormInput from '@/components/common/fromInput';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { resetPasswordSchema } from './resetPasswordSchema';
import { resetPasswordParams } from '@/services/auth/auth.Interface';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { AuthService } from '@/services/auth/auth.Service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/services/api';
import { ShieldAlert, Clock, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ResetPassword({ token }: { token: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [validLink, setValidLink] = useState(false);
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        const checkValidLink = async () => {
            if (!token) {
                setValidLink(false);
                setIsValidating(false);
                return;
            }
            try {
                setIsValidating(true);
                const res = await AuthService.resetPasswordLink(token);
                setValidLink(res);
            } catch (err) {
                setValidLink(false);
            } finally {
                setIsValidating(false);
            }
        }
        checkValidLink();
    }, [token])

    const { control, handleSubmit } = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
        try {
            setIsSubmitting(true);
            setError(null);
            const payload: resetPasswordParams = {
                token,
                password: data.password,
            };
            await AuthService.resetPassword(payload);
            toast.success("Password reset successfully");
            router.push("/login");
        } catch (err) {
            if (err instanceof ApiError && !err.isToast) {
                setError(err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isValidating) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl min-h-[300px] transition-all duration-300">
                <div className="relative flex items-center justify-center mb-5">
                    <div className="w-12 h-12 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-brand-secondary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Validating Link</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">Verifying reset token status...</p>
            </div>
        );
    }

    // If token is completely missing
    if (!isValidating && !token) {
        return (
            <div className="flex flex-col items-center text-center p-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping opacity-75" />
                    <ShieldAlert className="h-8 w-8 relative z-10" />
                </div>
                <Title title="Missing Reset Link" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 mb-6 leading-relaxed">
                    No reset token was provided. Please make sure you clicked the full link sent to your email, or request a new one below.
                </p>
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => router.push('/forgot-password')}
                        className="flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-full py-3.5 px-4 font-bold text-sm cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98] outline-none"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Request New Link
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-full py-3 px-4 font-semibold text-sm cursor-pointer transition-all active:scale-[0.98] outline-none"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // If token is invalid or expired
    if (!isValidating && !validLink) {
        return (
            <div className="flex flex-col items-center text-center p-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping opacity-75" />
                    <Clock className="h-8 w-8 relative z-10" />
                </div>
                <Title title="Reset Link Expired or Invalid" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 mb-6 leading-relaxed">
                    This password reset link is invalid, has expired, or has already been used. For your security, reset links are only valid for a limited time.
                </p>
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => router.push('/forgot-password')}
                        className="flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-full py-3.5 px-4 font-bold text-sm cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98] outline-none"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Request New Link
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-full py-3 px-4 font-semibold text-sm cursor-pointer transition-all active:scale-[0.98] outline-none"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Title title="Reset Password" />
            <form onSubmit={handleSubmit(onSubmit)}>
                <ErrorMessage error={error} isVisible={!!error} />

                <FormInput name="password" control={control} label="Password" isPassword />
                <FormInput name="confirmPassword" control={control} label="Confirm Password" isPassword />

                <SubmitButton type="submit" label={isSubmitting ? "Resetting..." : "Reset Password"} />
            </form>
        </div>
    );
}
