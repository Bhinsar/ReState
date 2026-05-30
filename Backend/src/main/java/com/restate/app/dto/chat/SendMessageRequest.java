package com.restate.app.dto.chat;

import com.restate.app.entity.Message;
import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.NotNull;

public record SendMessageRequest(
        @NotNull
        String conversationId,
        String content,
        @NotNull
        Message.MessageType messageType,
        String attachmentUrl
) {
    // Compact constructor - validation runs automatically on creation
    public SendMessageRequest {
        boolean isContentBlank = (content == null || content.trim().isEmpty());
        boolean isAttachmentBlank = (attachmentUrl == null || attachmentUrl.trim().isEmpty());

        if (isContentBlank && isAttachmentBlank) {
            throw new IllegalArgumentException("Both content and attachmentUrl cannot be blank at the same time.");
        }
    }
}

