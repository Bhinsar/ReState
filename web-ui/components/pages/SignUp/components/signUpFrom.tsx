import React from 'react';
import {Controller, useForm} from "react-hook-form";
import {signUpSchema} from "@/components/pages/SignUp/signUpSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import FormInput from "@/components/common/fromInput";
import {LockIcon, MailIcon, User} from "lucide-react";
import FromInput from "@/components/common/fromInput";
import {countries} from "@/data/country";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {signUpParams} from "@/services/auth/auth.Interface";
import {AuthService} from "@/services/auth/auth.Service";
import {toast} from "sonner";
import {ApiError} from "@/services/api";
import ErrorMessage from "@/components/common/errorMessage";

const SignUpFrom = () => {
    const {control, handleSubmit} = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues:{
            countryCode:"+91"
        }
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<null| string>(null);

    const onSignUp = async (data:signUpParams) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await AuthService.signUp(data);
            toast.success(`Welcome! ${res.firstName}`);
        }catch(err) {
            if (err instanceof ApiError) {
                setError(err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSignUp)}>
            <ErrorMessage error={error} isVisible={!!error}/>
            <FieldGroup className={"gap-2"}>
                {/*name*/}
                <div className="flex gap-3">
                    <FormInput name={"firstName"} control={control} startIcon={<User/>} label={"First Name"} placeholder={"Johan"}/>
                    <FormInput name={"lastName"} control={control} startIcon={<User/>} label={"Last Name"} placeholder={"Doe"} />
                </div>
                {/*email*/}
                <FromInput name={"email"} control={control} startIcon={<MailIcon />} placeholder={"john.doe@example.com"} label={"Email"}/>
                {/*pass*/}
                <FromInput name={"password"} control={control} startIcon={<LockIcon />} placeholder={"********"} label={"Password"} isPassword={true}/>
                {/*number*/}
                <div className="text-md font-medium">Phone Number</div>
                <div className="flex gap-2 w-full">
                    <FormInput name={"countryCode"} control={control} type={"select"} options={countries.map(( country) => ({
                        label: `${country.flag}  ${country.phone_code}`,
                        value: country.phone_code
                    }))}/>
                    <FormInput name={"phoneNumber"} control={control} style={"w-70"} placeholder={"5550123456"}/>
                </div>
                {/*dob*/}
                <Controller
                    name={"dateOfBirth"}
                    control={control}
                    render={({ field: { value, onChange, ...rest }, fieldState }) => {
                        const maxDate = new Date();
                        maxDate.setFullYear(maxDate.getFullYear() - 18);
                        const maxDateStr = maxDate.toISOString().split("T")[0];

                        // Convert Date → string for the input
                        const inputValue = value instanceof Date
                            ? value.toISOString().split("T")[0]
                            : (value ?? "");

                        return (
                            <Field className="w-full">
                                <FieldLabel className="text-md font-medium">
                                    Date of Birth
                                </FieldLabel>
                                <Input
                                    type="date"
                                    max={maxDateStr}
                                    value={inputValue}
                                    onChange={(e) => {
                                        // Convert string → Date for react-hook-form
                                        const date = e.target.value ? new Date(e.target.value) : null;
                                        onChange(date);
                                    }}
                                    className={cn(
                                        "rounded-full shadow-none border-2 transition-all w-full bg-white h-11",
                                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                                        fieldState.invalid
                                            ? "border-red-500 focus:border-red-600 focus-visible:border-red-600"
                                            : "border-gray-300 focus:border-primary focus-visible:border-primary",
                                    )}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        );
                    }}
                />
            </FieldGroup>
            <Button
                type="submit"
                className="bg-brand-secondary  hover:bg-brand-secondary/90 transition-all rounded-full py-5 cursor-pointer text-lg font-bold mt-8 w-full"
            >
                {isSubmitting? "Sign up..." : "SignUp"}
            </Button>

        </form>
    );
};

export default SignUpFrom;
