package com.restate.app.dto.auth;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.Date;

public record RegisterUserRequest(
//     country code
        @NotBlank(message = "country code is required")
        String countryCode,

//    phone number
        @NotBlank(message = "Mobile number is required")
        @Pattern(
                regexp = "^[0-9]{10}$",
                message = "Mobile number must be exactly 10 digits amd a valid number"
        )
        String phoneNumber,

//  Date of birth
        @NotNull(message = "Date of birth is required") // 1. Use @NotNull for Date types
        @JsonFormat(pattern = "yyyy-MM-dd")            // 2. Add this to match your JSON
        Date dateOfBirth
) {
}
