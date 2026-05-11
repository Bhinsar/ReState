package com.restate.app.dto.property;

import com.restate.app.entity.Property.PropertyType;
import com.restate.app.entity.Property.ListingType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateProperty(

        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        @Digits(integer = 15, fraction = 2, message = "Invalid price format")
        BigDecimal price,

        @NotNull(message = "Property type is required")
        PropertyType propertyType,

        @NotNull(message = "Listing type is required")
        ListingType listingType,

        @Min(value = 0, message = "Bedrooms cannot be negative")
        @Max(value = 20, message = "Bedrooms cannot exceed 20")
        int bedrooms,

        @Min(value = 0, message = "Bathrooms cannot be negative")
        @Max(value = 20, message = "Bathrooms cannot exceed 20")
        int bathrooms,

        @DecimalMin(value = "0.0", message = "Area cannot be negative")
        @Digits(integer = 10, fraction = 2, message = "Invalid area format")
        BigDecimal areaSqft,

        @NotNull(message = "Address is required")
        String addressId,

        @NotNull(message = "Images are required")
        @Size(min = 1, max = 5, message = "Must have between 1 and 5 images")
        @Valid
        List<CreatePropertyImage> images

) {
        public record CreatePropertyImage(

           @NotBlank(message = "Image URL is required")
           @Size(max = 500, message = "Image URL too long")
           String imageUrl,

           boolean isPrimary,

           @Min(value = 0, message = "Sort order cannot be negative")
           @Max(value = 4,  message = "Sort order cannot exceed 4")
           int sortOrder
        ) {}
}