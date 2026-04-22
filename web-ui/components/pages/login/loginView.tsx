"use client"
import React from 'react';
import Title from "@/components/common/title";
import LoginForm from "@/components/pages/login/components/loginForm";
import { useRouter } from "next/navigation";

function LoginView() {
    const router = useRouter();
    const handleSignIn = () => {
        router.push("/sign-up");
    }
    return (
        <div>
            <Title title={"Login"} subTitle={"Welcome back! Please enter your details."}/>
            <LoginForm />
            <div className={"pt-10 flex flex-col items-center justify-center"}>
                <div>You don't have an account?</div>
                <button type={"button"} onClick={handleSignIn} className={" decoration-brand-primary underline underline-offset-1 cursor-pointer text-brand-accent hover:text-brand-secondary"}>Sign up</button>
            </div>
        </div>
    );
}

export default LoginView;