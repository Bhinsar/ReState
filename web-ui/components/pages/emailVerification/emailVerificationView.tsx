'use client'
import React from 'react';
import Title from "@/components/common/title";
import EmailVerificationTimer from "@/components/pages/emailVerification/components/emailVerificationTimer";
import EmailVerificationForm from "@/components/pages/emailVerification/components/emailVerificationForm";

function EmailVerificationView() {
    return (
        <div className={'flex flex-col gap-2'}>
            <Title title={"Email-Verification"} subTitle={"Verify your email using the otp send at your email"} />
            <EmailVerificationForm/>
            <EmailVerificationTimer/>
        </div>
    );
}

export default EmailVerificationView;