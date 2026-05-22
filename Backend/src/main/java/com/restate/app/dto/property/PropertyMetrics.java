package com.restate.app.dto.property;

public record PropertyMetrics(
        long totalListing,
        long available,
        long sold,
        long rented,
        long draft
) {
}
