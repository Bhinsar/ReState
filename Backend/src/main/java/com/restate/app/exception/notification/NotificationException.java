package com.restate.app.exception.notification;

import com.restate.app.exception.AppException;
import com.restate.app.exception.media.MediaException;
import org.springframework.http.HttpStatus;

public class NotificationException extends AppException {
    public NotificationException(HttpStatus status, String message) {
        super(status, message);
    }

    public static NotificationException notYourNotification() {
        return new NotificationException(HttpStatus.FORBIDDEN, "Not your notification" );
    }

    public static NotificationException noNotification() {
        return new NotificationException(HttpStatus.BAD_REQUEST, "Notification not found" );
    }

}
