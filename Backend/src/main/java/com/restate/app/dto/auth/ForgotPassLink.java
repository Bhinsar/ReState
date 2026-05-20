package com.restate.app.dto.auth;

import jakarta.validation.constraints.NotNull;

public record ForgotPassLink(
        @NotNull(message = "Reset Password link is required")
        String token
) {
}
