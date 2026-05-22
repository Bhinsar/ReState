package com.restate.app.dto.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.util.Date;

public record UpdateUserRequest(

        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
        String lastName,

        @NotBlank(message = "Country code is required")
        String countryCode,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^[0-9]{10}$",
                message = "Phone number must be exactly 10 digits"
        )
        String phoneNumber,

        @NotNull(message = "Date of birth is required")
        @JsonFormat(pattern = "yyyy-MM-dd")
        Date dateOfBirth,

        // Optional — user can set/update their avatar URL
        String avatarUrl
) {
}
