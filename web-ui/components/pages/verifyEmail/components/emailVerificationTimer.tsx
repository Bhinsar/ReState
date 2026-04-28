import React, {useEffect, useState} from 'react';
import {AuthService} from "@/services/auth/auth.Service";

function EmailVerificationTimer() {
    const [remainingTime, setRemainingTime] = useState(0);
    const [timerActive, setTimerActive] = useState<boolean>(false);

    useEffect(() => {
        const storedExpiry = localStorage.getItem("emailVerification");
        let expiryMs;

        if (!storedExpiry) {
            expiryMs = Date.now() + 60 * 1000;
            localStorage.setItem("emailVerification", expiryMs.toString());
        } else {
            expiryMs = parseInt(storedExpiry, 10);
        }

        const calculateTimeLeft = () => {
            const now = Date.now();
            const diff = Math.round((expiryMs - now) / 1000);
            return diff > 0 ? diff : 0;
        };

        setRemainingTime(calculateTimeLeft());

        const timer = setInterval(() => {
            const timeLeft = calculateTimeLeft();
            setRemainingTime(timeLeft);

            if (timeLeft <= 0) {
                setTimerActive(false)
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);

    }, [timerActive]);

    const resendOtp = async () => {
        try {
            const res = await AuthService.resendOtp();
            if (res) {
                const newExpiry = Date.now() + 60 * 1000;

                localStorage.setItem("emailVerification", newExpiry.toString());

                setRemainingTime(60);
                setTimerActive(true);
            }

        } catch (error) {
            console.error("Failed to resend OTP:", error);
        }
    };

    return (
        <div className={"flex justify-center items-center"}>{remainingTime > 0 ?
            <div>
                Resend in <span className={"underline text-brand-secondary"}>{remainingTime}</span>s
            </div> : <div>
                You can <span className={"underline text-brand-secondary cursor-pointer font-bold"}
                              onClick={resendOtp}>resend</span> now!
            </div>}
        </div>
    );
}

export default EmailVerificationTimer;