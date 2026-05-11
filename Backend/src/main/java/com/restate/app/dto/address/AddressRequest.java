package com.restate.app.dto.address;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record AddressRequest(

        @NotBlank(message = "Address is required")
        @Size(max = 300, message = "Address too long")
        String address,

        @Size(max = 20, message = "Plot number too long")
        String plotNumber,

        @Size(max = 20, message = "Floor too long")
        String floor,

        @Size(max = 100, message = "Landmark too long")
        String landmark,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City too long")
        String city,

        @NotBlank(message = "State is required")
        @Size(max = 100, message = "State too long")
        String state,

        @NotBlank(message = "Country is required")
        @Size(max = 100, message = "Country too long")
        String country,

        @NotBlank(message = "PIN code is required")
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid Indian PIN code")
        @Size(max = 6, message = "PIN code must be 6 characters")
        String pinCode,

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
        @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
        BigDecimal latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
        @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
        BigDecimal longitude
) {
}
