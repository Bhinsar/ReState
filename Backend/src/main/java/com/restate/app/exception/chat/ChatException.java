package com.restate.app.exception.chat;

import org.springframework.http.HttpStatus;

import com.restate.app.exception.AppException;

public class ChatException extends AppException {
    public ChatException(HttpStatus status, String message) {super(status,message);}

    public static ChatException conversationNotFoundWithId() {
        return new ChatException(HttpStatus.NOT_FOUND, "Conversation with id  not found");
    }
    public static ChatException conversationNotFound() {
        return new ChatException(HttpStatus.NOT_FOUND, "Conversation  not found");
    }
    public static ChatException noParticipant() {
        return new ChatException(HttpStatus.BAD_REQUEST, "No participant found");
    }

    public static ChatException conversationYourSelf() {
        return new ChatException(HttpStatus.CONFLICT, "You can't chat with yourself");
    }
    public static ChatException conversationIsBlocked() {
        return new ChatException(HttpStatus.BAD_REQUEST, "Conversation is blocked");
    }
}
