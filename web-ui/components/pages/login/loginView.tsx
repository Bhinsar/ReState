"use client"
import React, { useEffect, useRef } from 'react';
import Title from "@/components/common/title";
import LoginForm from "@/components/pages/login/components/loginForm";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/components/common/BackButton";
import { toast } from "sonner";

const getFriendlyErrorMessage = (error: string) => {
    switch (error) {
        case "Signin":
            return "Try signing in with a different account.";
        case "OAuthSignin":
            return "Error occurred while trying to sign in with Google.";
        case "OAuthCallback":
            return "Error occurred during Google authentication callback.";
        case "OAuthCreateAccount":
            return "Could not create user account with Google.";
        case "EmailCreateAccount":
            return "Could not create email provider user.";
        case "Callback":
            return "Google login failed. Please try again.";
        case "OAuthAccountNotLinked":
            return "To confirm your identity, sign in with the same account you used originally.";
        case "EmailSignin":
            return "The e-mail could not be sent.";
        case "CredentialsSignin":
            return "Sign in failed. Check the details you provided are correct.";
        case "SessionRequired":
            return "Please sign in to access this page.";
        case "AccessDenied":
            return "Access denied. You do not have permission to log in, or your account may be banned.";
        case "Verification":
            return "The verification link has expired or is invalid.";
        case "Configuration":
            return "There is a configuration issue with the server.";
        default:
            try {
                return decodeURIComponent(error);
            } catch {
                return error;
            }
    }
};

function LoginView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const toastShownRef = useRef(false);

    useEffect(() => {
        if (error && !toastShownRef.current) {
            toastShownRef.current = true;
            const message = getFriendlyErrorMessage(error);
            toast.error(message);
            
            // Clean up the error query parameter from the URL to prevent double toasting on page refresh
            const params = new URLSearchParams(window.location.search);
            params.delete("error");
            const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
            window.history.replaceState(null, "", newUrl);
        }
    }, [error]);

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