package com.restate.app.dto.chat;

import com.restate.app.entity.User;

import java.time.Instant;

public record OtherUser(
        String id,
        String firstName,
        String lastName,
        String email,
        String avatarUrl,
        boolean isOnline,
        Instant lastSeen,
        Instant createdAt
) {

    public static com.restate.app.dto.chat.OtherUser from(User user) {
        return new com.restate.app.dto.chat.OtherUser(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getIsOnline(),
                user.getLastSeen(),
                user.getCreatedAt()
        );
    }
}
