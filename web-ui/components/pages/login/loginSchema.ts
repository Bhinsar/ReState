import {z} from "zod";

export const passwordSchema = z.string()
    .trim()
    .min(8, "Minimum length of 8 characters")
    .max(25, "Maximum length of 25 characters")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );

export const loginSchema = z.object({
    email: z
        .email("Invalid email address")
        .trim(),
    password : passwordSchema
})