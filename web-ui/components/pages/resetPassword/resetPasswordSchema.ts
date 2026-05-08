import { z } from "zod";
import { passwordSchema } from "../login/loginSchema";

export const resetPasswordSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: passwordSchema,
    confirmPassword: z.string().nonempty("Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type resetPasswordParams = z.infer<typeof resetPasswordSchema>;