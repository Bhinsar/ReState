package com.restate.app.dto.chat;

import com.restate.app.dto.user.UserResponse;
import com.restate.app.entity.Conversation;

import java.time.Instant;

public record ConversationResponse(
        String conversationId,
        OtherUser otherParticipant,
        long unreadMessageCount,
        String lastMessageContent,
        Instant lastMessageTime,
        Conversation.ConversationStatus status
) {}
