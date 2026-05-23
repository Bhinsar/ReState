import { z } from 'zod';

// ─── Profile Schema ───────────────────────────────────────────────────────────
export const profileSchema = z.object({
    firstName:   z.string().min(1, 'First name is required').max(50),
    lastName:    z.string().min(1, 'Last name is required').max(50),
    phoneNumber: z.string().min(6, 'Phone number is required').max(20),
    countryCode: z.string().min(1, 'Country code is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

export type ProfileForm = z.infer<typeof profileSchema>;

// ─── Password Schema ──────────────────────────────────────────────────────────
export const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type PasswordForm = z.infer<typeof passwordSchema>;
