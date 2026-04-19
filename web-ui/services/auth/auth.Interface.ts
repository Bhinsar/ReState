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