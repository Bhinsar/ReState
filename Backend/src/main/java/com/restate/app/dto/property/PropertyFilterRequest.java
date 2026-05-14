package com.restate.app.dto.property;

import com.restate.app.entity.Property.PropertyType;
import com.restate.app.entity.Property.ListingType;
import com.restate.app.entity.Property.PropertyStatus;

import java.math.BigDecimal;

public record PropertyFilterRequest(
        String city,
        String state,
        PropertyType propertyType,
        ListingType listingType,
        PropertyStatus status,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer minBedrooms,
        Integer minBathrooms,
        String search
) {}
