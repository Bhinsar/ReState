import { z } from "zod";
import { passwordSchema } from "../login/loginSchema";

export const resetPasswordSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string().nonempty("Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type resetPasswordParams = z.infer<typeof resetPasswordSchema>;