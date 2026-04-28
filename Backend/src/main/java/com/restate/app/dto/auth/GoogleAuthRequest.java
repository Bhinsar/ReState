package com.restate.app.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record GoogleAuthRequest(
        @NotBlank(message = "Didn't receive any token")
        String id_token
) {
}
