package com.restate.app.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min=8, max=20, message = "Password must be between 6 and 20 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[@$!%*?&#]).+$",
            message = "Password must contain at least one uppercase letter and one special character (@$!%*?&#)"
    )
    String password
) {
}
