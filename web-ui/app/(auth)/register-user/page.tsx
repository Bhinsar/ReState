import React from 'react';
import {Metadata} from "next";
import RegisterUserView from "@/components/pages/registerUser/registerUserView";

export const metadata: Metadata = {
    title: "Register User",
    description: "Complete your registration steps",
}

function RegisterUser() {
    return (
        <RegisterUserView/>
    );
}

export default RegisterUser;