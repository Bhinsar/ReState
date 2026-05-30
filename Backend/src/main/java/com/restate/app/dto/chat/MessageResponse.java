package com.restate.app.dto.chat;

import java.time.Instant;

import com.restate.app.entity.Message;

public record MessageResponse(
        String id,
        String conversationId,
        OtherUser sender,
        String content,
        Message.MessageType messageType,
        String attachmentUrl,
        boolean isRead,
        Instant sentAt
) {
    public static MessageResponse from(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getConversation().getConversationId(),
                OtherUser.from(m.getSender()),
                m.getContent(),
                m.getMessageType(),
                m.getAttachmentUrl(),
                m.isRead(),
                m.getSentAt()
        );
    }
}
