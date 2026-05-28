package com.restate.app.dto.chat;

public record TypingRequest(
        String conversationId,
        boolean isTyping
) {}

