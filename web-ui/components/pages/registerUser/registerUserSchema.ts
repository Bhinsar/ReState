import {phoneNumberSchema} from "@/components/pages/SignUp/signUpSchema";
import z from "zod";

export const RegisterUserSchema = z.object({
    countryCode: z.string(),
    phoneNumber: phoneNumberSchema,
    dateOfBirth: z.date()
})