package com.restate.app.exception.media;

import com.restate.app.exception.AppException;
import org.springframework.http.HttpStatus;

public class MediaException extends AppException {
    public MediaException(HttpStatus status, String message) {
        super(status, message);
    }
    public static MediaException failed() {
        return new MediaException(HttpStatus.BAD_REQUEST, "Failed to upload the file" );
    }
}
