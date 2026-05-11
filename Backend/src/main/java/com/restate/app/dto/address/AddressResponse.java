package com.restate.app.dto.address;

import java.math.BigDecimal;
import java.time.Instant;

public record AddressResponse(
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
        BigDecimal longitude,
        Instant createdAt,
        Instant updatedAt
) {
}
