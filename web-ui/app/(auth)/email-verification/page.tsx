import React, {JSX} from 'react';
import {Metadata} from "next";
import EmailVerificationView from "@/components/pages/emailVerification/emailVerificationView";

export const metadata: Metadata = {
    title: "Email Verification",
    description: "Verification email verification",
}
function EmailVerification(): JSX.Element {
    return (
        <EmailVerificationView/>
    );
}

export default EmailVerification;