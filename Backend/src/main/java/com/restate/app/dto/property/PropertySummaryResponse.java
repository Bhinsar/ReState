package com.restate.app.dto.property;

import com.restate.app.entity.Property.PropertyType;
import com.restate.app.entity.Property.ListingType;
import com.restate.app.entity.Property.PropertyStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PropertySummaryResponse(
        String propertyId,
        String title,
        BigDecimal price,
        PropertyType propertyType,
        ListingType listingType,
        PropertyStatus status,
        int bedrooms,
        int bathrooms,
        BigDecimal areaSqft,
        Instant createdAt,
        String city,
        String state,
        String primaryImageUrl
) {}
