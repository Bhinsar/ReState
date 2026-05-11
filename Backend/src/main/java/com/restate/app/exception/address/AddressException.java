package com.restate.app.exception.address;

import com.restate.app.exception.auth.AuthException;
import org.springframework.http.HttpStatus;

public class AddressException extends AuthException {

    public AddressException(HttpStatus status, String message) {
        super(status, message);
    }

    public static AddressException noAddressFound() {
        return new AddressException(HttpStatus.NOT_FOUND, "No address found");
    }

    public static AddressException unauthorized() {
        return new AddressException(HttpStatus.FORBIDDEN, "You are not authorized to access this address");
    }

}
