export interface loginParams {
    email: string,
    password: string
}

export interface authResponse {
    firstName: string,
    lastName: string,
    email: string,
    registerStep: string,
    avatarUrl: string
}

export interface signUpParams {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    countryCode: string
    phoneNumber: string,
    dateOfBirth: Date,
}

export interface registerUserParams {
    countryCode: string
    phoneNumber: string,
    dateOfBirth: Date,
}

export interface forgotPasswordParams {
    email: string
}

export interface resetPasswordParams {
    email: string,
    otp: string,
    password: string
}