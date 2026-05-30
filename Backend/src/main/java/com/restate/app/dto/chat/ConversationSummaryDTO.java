package com.restate.app.dto.chat;

import com.restate.app.entity.Conversation;

import java.time.Instant;

public record ConversationSummaryDTO(
        Conversation conversation,
        Long unreadCount,
        String lastMessageContent,
        Instant lastMessageTime
) {
    public ConversationSummaryDTO(Conversation conversation, Long unreadCount, String lastMessageContent, Instant lastMessageTime) {
        this.conversation = conversation;
        this.unreadCount = unreadCount;
        this.lastMessageContent = lastMessageContent;
        this.lastMessageTime = lastMessageTime;
    }
}
