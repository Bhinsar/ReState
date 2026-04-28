import React from 'react';
import { Metadata } from "next";
import SignUpView from "@/components/pages/SignUp/signUpView";

export const metadata: Metadata = {
    title: "SignUp",
    description: "Register a new user",
}

export default function SignUp() {
    return (
        <SignUpView />
    );
}