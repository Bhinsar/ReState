'use client'
import React from 'react';
import Title from "@/components/common/title";
import SignUpFrom from "@/components/pages/SignUp/components/signUpFrom";

function SignUpView() {
    return (
        <div>
            <Title title={"SignUp"} subTitle={"Get a new house"}/>
            <SignUpFrom/>
        </div>
    );
}

export default SignUpView;