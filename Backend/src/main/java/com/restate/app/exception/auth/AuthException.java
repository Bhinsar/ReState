package com.restate.app.exception.auth;

import com.restate.app.exception.AppException;
import org.springframework.http.HttpStatus;

public class AuthException extends AppException {

    public AuthException(HttpStatus status, String message){
        super(status, message);
    }

    public static AuthException emailAlreadyExists() {
        return new AuthException(HttpStatus.CONFLICT, "Email already registered");
    }

    public static AuthException invalidCredentials() {
        return new AuthException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    public static AuthException tokenExpired() {
        return new AuthException(HttpStatus.UNAUTHORIZED, "Session expired, please login again");
    }
    public static AuthException otpExpired() {
        return new AuthException(HttpStatus.BAD_REQUEST, "OTP is expired or Invalid");
    }
    public static AuthException noUserFound() {
        return new AuthException(HttpStatus.BAD_REQUEST, "User don't exists");
    }
    public static AuthException invalidOTP(){
        return new AuthException(HttpStatus.BAD_REQUEST, "Otp is Required and should be 6 charter long");
    }


}
