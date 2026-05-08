"use client"
import ErrorMessage from '@/components/common/errorMessage';
import SubmitButton from '@/components/common/submitButton';
import Title from '@/components/common/title'
import FormInput from '@/components/common/fromInput';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { resetPasswordSchema } from './resetPasswordSchema';
import { resetPasswordParams } from '@/services/auth/auth.Interface';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { AuthService } from '@/services/auth/auth.Service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/services/api';

export default function ResetPassword({ email }: { email: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { control, handleSubmit } = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            otp: "",
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
        try {
            setIsSubmitting(true);
            setError(null);
            const payload: resetPasswordParams = {
                email,
                otp: data.otp,
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

  return (
    <div>
        <Title title="Reset Password"/>
        <form onSubmit={handleSubmit(onSubmit)}>
            <ErrorMessage error={error} isVisible={!!error}/>

            <FormInput name="otp" control={control} label="OTP" />
            <FormInput name="password" control={control} label="Password"  isPassword/>
            <FormInput name="confirmPassword" control={control} label="Confirm Password" isPassword/>
            
            <SubmitButton type="submit" label={isSubmitting ? "Resetting..." : "Reset Password"} />
        </form>
    </div>
  )
}
