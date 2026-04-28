'use client'
import React from 'react';
import Title from "@/components/common/title";
import BackButton from "@/components/common/BackButton";
import {AuthService} from "@/services/auth/auth.Service";
import {useRouter} from "next/navigation";
import RegisterUserForm from "@/components/pages/registerUser/components/registerUserForm";

function RegisterUserView() {
    const router = useRouter();
    const onClick = async () => {
        try {
            await AuthService.logout()
            router.push("/login")
        } catch (e) {
            console.error(e)
        }
    }
    return (
        <div className={'md:relative'}>
            <BackButton className={'md:-top-13 md:-left-4'} onClick={onClick}/>
            <Title title={"Complete Your Registration"}/>
            <RegisterUserForm/>
        </div>
    );
}

export default RegisterUserView;