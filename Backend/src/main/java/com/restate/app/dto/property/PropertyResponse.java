package com.restate.app.dto.property;

import com.restate.app.entity.Property.PropertyType;
import com.restate.app.entity.Property.ListingType;
import com.restate.app.entity.Property.PropertyStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record PropertyResponse(
        String propertyId,
        String title,
        String description,
        BigDecimal price,
        PropertyType propertyType,
        ListingType listingType,
        PropertyStatus status,
        int bedrooms,
        int bathrooms,
        BigDecimal areaSqft,
        Instant createdAt,
        Instant updatedAt,
        PropertyOwnerResponse owner,
        PropertyAddressResponse address,
        List<PropertyImageResponse> images
) {
    public record PropertyOwnerResponse(
            String id,
            String firstName,
            String lastName,
            String email,
            String avatarUrl,
            String phoneNumber
    ) {}

    public record PropertyAddressResponse(
            String addressId,
            String address,
            String plotNumber,
            String floor,
            String landmark,
            String city,
            String state,
            String country,
            String pinCode,
            BigDecimal latitude,
            BigDecimal longitude
    ) {}

    public record PropertyImageResponse(
            String imageId,
            String imageUrl,
            boolean isPrimary,
            int sortOrder
    ) {}
}
