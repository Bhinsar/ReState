'use client'
import React from 'react';
import Title from "@/components/common/title";
import EmailVerificationTimer from "@/components/pages/verifyEmail/components/emailVerificationTimer";
import EmailVerificationForm from "@/components/pages/verifyEmail/components/emailVerificationForm";
import BackButton from "@/components/common/BackButton";
import {AuthService} from "@/services/auth/auth.Service";
import {useRouter} from "next/navigation";

function VerifyEmailView() {
    const router = useRouter();
    const onClick = async () => {
        try {
            await AuthService.logout()
            router.push("/login")
        }catch (e){
            console.error(e)
        }
    }
    return (
        <div className={'flex flex-col gap-2 md:relative'}>
            <BackButton className={'md:-top-10 md:-left-4'} onClick={onClick} />
            <Title title={"Email-Verification"} subTitle={"Verify your email using the otp send at your email"} />
            <EmailVerificationForm/>
            <EmailVerificationTimer/>
        </div>
    );
}

export default VerifyEmailView;