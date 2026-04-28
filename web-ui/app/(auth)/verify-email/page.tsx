import React, {JSX} from 'react';
import {Metadata} from "next";
import VerifyEmailView from "@/components/pages/verifyEmail/verifyEmailView";

export const metadata: Metadata = {
    title: "Email Verification",
    description: "Verification email verification",
}
function VerifyEmail(): JSX.Element {
    return (
        <VerifyEmailView/>
    );
}

export default VerifyEmail;