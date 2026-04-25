"use client"
import React from 'react';
import Title from "@/components/common/title";
import LoginForm from "@/components/pages/login/components/loginForm";
import { useRouter } from "next/navigation";
import BackButton from "@/components/common/BackButton";

function LoginView() {
    const router = useRouter();
    const handleSignIn = () => {
        router.push("/sign-up");
    }
    const onClick = async () => {
        try{
            router.push("/");
        }catch (e){
            console.error(e);
        }
    }
    return (
        <div className={"md:relative"}>
            <BackButton className={'md:-top-15 md:-left-4'} onClick={onClick} />
            <Title title={"Login"} subTitle={"Welcome back! Please enter your details."}/>
            <LoginForm />
            <div className={"pt-10 flex flex-col items-center justify-center"}>
                <div>You don&#39;t have an account?</div>
                <button type={"button"} onClick={handleSignIn} className={" decoration-brand-primary underline underline-offset-1 cursor-pointer text-brand-accent hover:text-brand-secondary"}>Sign up</button>
            </div>
        </div>
    );
}

export default LoginView;