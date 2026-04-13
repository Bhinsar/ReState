package com.restate.app.dto.auth;

public record RefreshResponse(
        String accessToken,
        String refreshToken
) {
    public static RefreshResponse forMobile(String accessToken, String refreshToken) {
        return new RefreshResponse(accessToken, refreshToken);
    }

    public static RefreshResponse forWeb() {
        return new RefreshResponse(null, null); // tokens go in cookies
    }
}