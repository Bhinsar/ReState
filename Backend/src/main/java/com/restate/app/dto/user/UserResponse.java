package com.restate.app.dto.user;

import java.time.Instant;
import java.util.Date;

import com.restate.app.entity.User;

public record UserResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        String avatarUrl,
        String countryCode,
        String phoneNumber,
        Date dateOfBirth,
        User.Role role,
        boolean isOnline,
        Instant lastSeen,
        User.RegisterStep registerStep,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getCountryCode(),
                user.getPhoneNumber(),
                user.getDateOfBirth(),
                user.getRole(),
                user.getIsOnline(),
                user.getLastSeen(),
                user.getRegistrationStep(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
