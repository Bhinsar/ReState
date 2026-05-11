package com.restate.app.exception.property;

import com.restate.app.exception.auth.AuthException;
import org.springframework.http.HttpStatus;

public class PropertyException extends AuthException {
    public PropertyException(HttpStatus status, String message) {
        super(status, message);
    }

    public static PropertyException noPropertyFound() {
        return new PropertyException(HttpStatus.NOT_FOUND, "No property found");
    }

    public static PropertyException unauthorized() {
        return new PropertyException(HttpStatus.UNAUTHORIZED, "Unauthorized to update this property");
    }
}
