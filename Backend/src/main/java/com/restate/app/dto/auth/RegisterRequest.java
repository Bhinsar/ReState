package com.restate.app.dto.auth;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Date;

public record RegisterRequest(

//  first name
    @NotBlank(message = "First Name is required")
    @Size(min = 2, max=50, message= "First Name must be between 2 and 50 characters")
    String firstName,

//    last name
    @NotBlank(message = "Last Name is required")
    @Size(min = 2, max=50, message= "Last Name must be between 2 and 50 characters")
    String lastName,

//    email
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    String email,

//    password
    @NotBlank(message = "Password is required")
    @Size(min=8, max=20, message = "Password must be between 6 and 20 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[@$!%*?&#]).+$",
            message = "Password must contain at least one uppercase letter and one special character (@$!%*?&#)"
    )
    String password,

//    country code
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
