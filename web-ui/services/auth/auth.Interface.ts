export interface loginParams{
    email: string,
    password: string
}
export interface authResponse{
    firstName: string,
    lastName: string,
    email: string,
    registerStep: string,
}

export interface signUpParams{
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    countryCode: string
    phoneNumber: string,
    dateOfBirth: Date,
}