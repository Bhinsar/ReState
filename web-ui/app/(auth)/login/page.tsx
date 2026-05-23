import React from 'react';
import { Metadata } from "next";
import LoginView from "@/components/pages/login/loginView";
import Loading from '@/components/common/loading';

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your account"
}

export default function Login() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
            <LoginView/>
        </React.Suspense>
    );
}