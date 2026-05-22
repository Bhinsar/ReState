package com.restate.app.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*[@$!%*?&#]).+$",
                message = "Password must contain at least one uppercase letter and one special character (@$!%*?&#)"
        )
        String newPassword
) {
}
