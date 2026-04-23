import React, { useRef, useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { ApiError } from "@/services/api";
import { AuthService } from "@/services/auth/auth.Service";
import SubmitButton from "@/components/common/submitButton";
import ErrorMessage from "@/components/common/errorMessage";

// Updated to 6 as per your request
const OTP_LENGTH = 6;

function EmailVerificationForm() {
    const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
    const [isSubmit, setIsSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


    const submitOtp = async (otpValue: string) => {
        try {
            if(isSubmit)return
            setIsSubmit(true);
            setError(null);
            if (otpValue.length < OTP_LENGTH) {
                setError(`OTP length should be ${OTP_LENGTH} characters long.`);
                return;
            }
            const res = await AuthService.verifyOtp(otpValue);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            }
        } finally {
            setIsSubmit(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        // Take only the last character if someone types fast
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        const otpString = newOtp.join("");

        // Auto-submit if the length is reached
        if (otpString.length === OTP_LENGTH) {
            submitOtp(otpString);
        }

        // Focus next input
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                // Move to previous if current is empty and backspace is pressed
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "Enter") {
            const otpString = otp.join("");
            if (otpString.length === OTP_LENGTH) {
                submitOtp(otpString);
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .trim()
            .slice(0, OTP_LENGTH)
            .split("");

        if (pastedData.every((char) => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            pastedData.forEach((char, i) => {
                newOtp[i] = char;
            });
            setOtp(newOtp);

            const otpString = newOtp.join("");

            // Auto-submit on paste if complete
            if (otpString.length === OTP_LENGTH) {
                submitOtp(otpString);
            }

            // Focus the last filled input or the next empty one
            const nextFocusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
            inputRefs.current[nextFocusIndex]?.focus();
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); submitOtp(otp.join("")); }}>
            <ErrorMessage error={error} isVisible={!!error} />
            <div className="flex flex-col gap-4 items-center">
                <div className="flex gap-2 sm:gap-4 justify-center items-center">
                    {otp.map((digit, i) => (
                        <Input
                            key={i}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            ref={(el) => {
                                inputRefs.current[i] = el;
                            }}
                            value={digit}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            onPaste={handlePaste}
                            className="w-12 h-12 text-center text-lg font-bold rounded-full border
                               focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary
                               outline-none transition-all"
                        />
                    ))}
                </div>

                <SubmitButton
                    label={isSubmit ? "Verifying..." : "Verify"}
                    type="submit"
                    isDisabled={otp.join("").length < OTP_LENGTH || isSubmit}
                />
            </div>
        </form>
    );
}

export default EmailVerificationForm;