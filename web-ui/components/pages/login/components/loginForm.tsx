import React, {useState} from 'react';
import {useForm} from "react-hook-form";
import {loginSchema} from "@/components/pages/login/loginSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {FieldGroup} from "@/components/ui/field";
import FromInput from "@/components/common/fromInput";
import {LockIcon, MailIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {AuthService} from "@/services/auth/auth.Service";
import {loginParams} from "@/services/auth/auth.Interface";
import {ApiError} from "@/services/api";
import { toast } from "sonner"
import ErrorMessage from "@/components/common/errorMessage";

const LoginForm = () => {
    const {control, handleSubmit} = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (data: loginParams) => {
        try {
            setIsLogin(true);
            setError(null);
            const res = await AuthService.login(data);
            toast.success(`Welcome back! ${res.firstName}`);
        } catch(err) {
            if (err instanceof ApiError) {
                setError(err.message);
            }
        } finally {
            setIsLogin(false);
        }
    }
    return (
        <form onSubmit={handleSubmit(login)}>
            <ErrorMessage error={error} isVisible={!!error}/>
            <FieldGroup className={"gap-2.5"}>
                <FromInput name={"email"} control={control} startIcon={<MailIcon />} placeholder={"john.doe@example.com"} label={"Email"}/>

                <FromInput name={"password"} control={control} startIcon={<LockIcon />} placeholder={"********"} label={"Password"} isPassword={true}/>
            </FieldGroup>
            <div className={"relative flex items-center mt-5 "}>
                <button type="button" className={"text-brand-accent text-sm absolute right-2 cursor-pointer hover:text-brand-secondary"}>Forget Password?</button>
            </div>
            <div className="flex justify-end gap-2.5 mt-4">

            <Button
                type="submit"
                className="bg-brand-secondary  hover:bg-brand-secondary/90 transition-all w-1/2 rounded-full py-5 cursor-pointer text-lg font-bold"
            >
                {isLogin? "Login...":"Login"}
            </Button>
            <Button
                type="button"
                className="bg-white border-gray-600 hover:bg-gray-100 transition-all w-1/2 rounded-full py-5 cursor-pointer text-sm font-bold text-gray-500"
            >
                <Image src={"/images/google.svg"} alt={"googleLogo"} width={20} height={20}
                       className="object-contain "/>
                Continue with Google
            </Button>
            </div>

        </form>
    );
};

export default LoginForm;