package com.restate.app.dto.auth;

import com.restate.app.entity.User;
import jakarta.annotation.Nullable;

public record AuthResponse(
    String firstName,
    String lastName,
    String email,
    String avatarUrl,
    User.RegisterStep registerStep,
    @Nullable Token token
) {
    public static AuthResponse forMobile(User user, String accessToken, String refreshToken) {
        Token token = new Token(accessToken, refreshToken);
        return new AuthResponse(user.getFirstName(), user.getLastName(), user.getEmail(), user.getAvatarUrl(), user.getRegistrationStep(), token);
    }

    public static AuthResponse forWeb(User user) {
        return new AuthResponse(user.getFirstName(), user.getLastName(), user.getEmail(), user.getAvatarUrl(), user.getRegistrationStep(), null);
    }
}

