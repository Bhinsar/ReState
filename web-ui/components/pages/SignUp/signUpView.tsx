'use client'
import React from 'react';
import Title from "@/components/common/title";
import SignUpFrom from "@/components/pages/SignUp/components/signUpFrom";
import { useRouter } from "next/navigation";

function SignUpView() {
    const router = useRouter();
    const handleLogin = () => {
        router.push("/login");
    }
    return (
        <div>
            <Title title={"SignUp"} subTitle={"Get a new house"}/>
            <SignUpFrom/>
            <div className={"pt-8 flex flex-col items-center justify-center"}>
                <div>Already have an account</div>
                <button type={"button"} onClick={handleLogin}
                        className={" decoration-brand-primary underline underline-offset-1 cursor-pointer text-brand-accent hover:text-brand-secondary"}>Login
                </button>
            </div>
        </div>
    );
}

export default SignUpView;