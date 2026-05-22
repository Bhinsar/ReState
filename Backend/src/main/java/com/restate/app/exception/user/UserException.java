package com.restate.app.exception.user;

import org.springframework.http.HttpStatus;

import com.restate.app.exception.AppException;

public class UserException extends AppException {

    public UserException(HttpStatus status, String message) {
        super(status, message);
    }

    public static UserException notFound() {
        return new UserException(HttpStatus.NOT_FOUND, "User not found");
    }

    public static UserException alreadyDeleted() {
        return new UserException(HttpStatus.GONE, "User account has already been deleted");
    }

    public static UserException underage() {
        return new UserException(HttpStatus.BAD_REQUEST, "User must be at least 18 years old");
    }

    public static UserException wrongPassword() {
        return new UserException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
    }

    public static UserException samePassword() {
        return new UserException(HttpStatus.BAD_REQUEST, "New password must be different from the current password");
    }
}
