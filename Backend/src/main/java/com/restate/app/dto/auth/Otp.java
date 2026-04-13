package com.restate.app.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record Otp(
        @NotBlank(message = "OTP cannot be empty")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        @Pattern(regexp = "^[0-9]*$", message = "OTP must be numeric")
        String otp
) {
}
