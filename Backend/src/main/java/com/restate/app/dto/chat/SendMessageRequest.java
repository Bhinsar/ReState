package com.restate.app.dto.chat;

public record SendMessageRequest(
        String conversationId,
        String content
) {}

