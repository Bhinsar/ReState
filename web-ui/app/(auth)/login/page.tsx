import React from 'react';
import { Metadata } from "next";
import LoginView from "@/components/pages/login/loginView";

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your account"
}

export default function Login() {
    return (
        <LoginView/>
    );
}