package com.restate.app.dto.auth;

import jakarta.validation.constraints.*;

public record ResetPassword(
        @NotNull(message = "Reset Password link is required")
        String token,

        @NotBlank(message = "Password is required")
        @Size(min=8, max=20, message = "Password must be between 6 and 20 characters")
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*[@$!%*?&#]).+$",
                message = "Password must contain at least one uppercase letter and one special character (@$!%*?&#)"
        )
        String password

) {
}
