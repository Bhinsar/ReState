package com.restate.app.dto.chat;

import com.restate.app.dto.user.UserResponse;
import com.restate.app.entity.Message;
import java.time.Instant;

public record MessageResponse(
        String id,
        String conversationId,
        UserResponse sender,
        String content,
        Message.MessageType messageType,
        String attachmentUrl,
        String attachmentName,
        Long attachmentSize,
        boolean isRead,
        Instant sentAt
) {
    public static MessageResponse from(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getConversation().getConversationId(),
                UserResponse.from(m.getSender()),
                m.getContent(),
                m.getMessageType(),
                m.getAttachmentUrl(),
                m.getAttachmentName(),
                m.getAttachmentSize(),
                m.isRead(),
                m.getSentAt()
        );
    }
}
