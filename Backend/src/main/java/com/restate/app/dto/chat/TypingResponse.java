package com.restate.app.dto.chat;

public record TypingResponse(
        String senderId,
        String senderName,
        String conversationId,
        boolean isTyping
) {}
