export interface UpdateUserReq {
    firstName: string;
    lastName: string;
    countryCode: string;
    phoneNumber: string;
    dateOfBirth: Date;
    avatarUrl: string
}

export interface ChangePasswordReq {
    currentPassword : string;
    newPassword: string;
}

export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum RegisterStep {
    GMAIL = "GMAIL",
    REGISTERED = "REGISTERED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
}

export interface UserRes {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    countryCode: string;
    phoneNumber: string;
    dateOfBirth: Date;
    avatarUrl: string;
    registerStep: RegisterStep;
    createdAt: Date;
    updatedAt: Date;
}