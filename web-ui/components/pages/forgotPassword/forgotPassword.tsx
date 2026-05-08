"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "./forgotPasswordSchema";
import { forgotPasswordParams } from "@/services/auth/auth.Interface";
import { AuthService } from "@/services/auth/auth.Service";
import Title from "@/components/common/title";
import { useState } from "react";
import FormInput from "@/components/common/fromInput";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/common/errorMessage";
import SubmitButton from "@/components/common/submitButton";

export default function ForgotPassword() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const {handleSubmit,control} = useForm<forgotPasswordParams>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: ""
        }
    })

    const onSubmit = async (data: forgotPasswordParams) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await AuthService.forgotPassword(data.email);
            toast.success("Reset link sent successfully");
            router.push(`/reset-password/${data.email}`);
        } catch (err) {
            if (err instanceof ApiError && !err.isToast) {
                setError(err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <div className="">
            <Title title="Forgot Password"/>

            <form onSubmit={handleSubmit(onSubmit)}>
                <ErrorMessage error={error} isVisible={!!error}/>
                <FormInput name="email" control={control} label="Email" />
                <SubmitButton type="submit" label={isSubmitting ? "Sending..." : "Send Reset Link"} />
            </form>
        </div>
    );
}