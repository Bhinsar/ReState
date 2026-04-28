import React from 'react';
import FormInput from "@/components/common/fromInput";
import {countries} from "@/data/country";
import {Controller, useForm} from "react-hook-form";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import SubmitButton from "@/components/common/submitButton";
import z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {RegisterUserSchema} from "@/components/pages/registerUser/registerUserSchema";
import {useRouter} from "next/navigation";
import {AxiosError} from "axios";
import {AuthService} from "@/services/auth/auth.Service";
import {registerUserParams} from "@/services/auth/auth.Interface";
import ErrorMessage from "@/components/common/errorMessage";

function RegisterUserForm() {

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<null | string>(null);
    const router = useRouter();

    const eighteenYearsAgo = React.useMemo(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        return date;
    }, []);
    const maxDateStr = eighteenYearsAgo.toISOString().split("T")[0];

    const {control, handleSubmit} = useForm<z.infer<typeof RegisterUserSchema>>({
        resolver: zodResolver(RegisterUserSchema),
        defaultValues: {
            phoneNumber: "",
            dateOfBirth: eighteenYearsAgo,
            countryCode: "+91"
        }
    })

    const onSubmit = async (data: registerUserParams) => {
        try {
            setIsSubmitting(true);
            setError(null);
            await AuthService.registerUser(data)
            router.push("/")
        } catch (e) {
            if (e instanceof AxiosError) {
                setError(e.message)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ErrorMessage error={error} isVisible={!!error}/>
            <FieldGroup>
                {/*number*/}
                <div className="text-md font-medium">Phone Number</div>
                <div className="flex flex-row items-start gap-2 w-full">
                    {/* Country Code: Fixed width or constrained to content */}
                    <div className="w-1/3 sm:w-32">
                        <FormInput
                            name={"countryCode"}
                            control={control}
                            type={"select"}
                            options={countries.map((country) => ({
                                label: `${country.flag} ${country.phone_code}`,
                                value: country.phone_code
                            }))}
                        />
                    </div>

                    {/* Phone Number: Expands to fill the rest of the row */}
                    <div className="flex-1">
                        <FormInput
                            name={"phoneNumber"}
                            control={control}
                            placeholder={"5550123456"}
                            style={"w-full"} // Ensures it fills its flex container
                        />
                    </div>
                </div>
                {/*dob*/}
                <Controller
                    name={"dateOfBirth"}
                    control={control}
                    render={({field: {value, onChange, ...rest}, fieldState}) => {

                        // Format Date object to YYYY-MM-DD string for the input display
                        const inputValue = value instanceof Date
                            ? value.toISOString().split("T")[0]
                            : "";

                        return (
                            <Field className="w-full">
                                <FieldLabel className="text-md font-medium">
                                    Date of Birth
                                </FieldLabel>
                                <Input
                                    {...rest}
                                    type="date"
                                    // Use the string formatted date, not the Date object
                                    max={maxDateStr}
                                    value={inputValue}
                                    onChange={(e) => {
                                        const dateStr = e.target.value;
                                        // Return Date object back to React Hook Form/Zod
                                        onChange(dateStr ? new Date(dateStr) : null);
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
                                    <FieldError errors={[fieldState.error]}/>
                                )}
                            </Field>
                        );
                    }}
                />
            </FieldGroup>
            <SubmitButton
                type="submit"
                label={isSubmitting ? "Sign up..." : "SignUp"}
                isDisabled={isSubmitting}
                // className="bg-brand-secondary  hover:bg-brand-secondary/90 transition-all rounded-full py-5 cursor-pointer text-lg font-bold mt-8 w-full"
            />

        </form>
    );
}

export default RegisterUserForm;