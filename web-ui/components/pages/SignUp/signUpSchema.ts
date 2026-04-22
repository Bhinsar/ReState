import z from "zod";
import {passwordSchema} from "@/components/pages/login/loginSchema";

export const phoneNumberSchema =  z
        .string()
        .regex(/^[0-9]{10}$/, "Please enter a valid phone number")

export const signUpSchema = z.object({
    firstName: z.string().trim().min(2, "First Name should be at least 3 characters").max(25,"First Name should not be 25 charter long"),
    lastName: z.string().trim().min(2, "Last Name should be at least 3 characters").max(25,"Last Name should not be 25 charter long"),
    email:z.email("Invalid email address").trim(),
    password: passwordSchema,
    countryCode: z.string(),
    phoneNumber: phoneNumberSchema,
    dateOfBirth: z.date()
})