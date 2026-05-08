import {z} from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
})

export type forgotPasswordParams = z.infer<typeof forgotPasswordSchema>;