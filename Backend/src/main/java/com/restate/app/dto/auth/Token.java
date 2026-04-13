package com.restate.app.dto.auth;

public record Token(
        String accessToken,
        String refreshToken
) {}
