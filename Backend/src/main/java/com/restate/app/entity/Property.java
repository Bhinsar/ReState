package com.restate.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Builder
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "properties")
@EntityListeners(AuditingEntityListener.class)
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "property_id", updatable = false, nullable = false)
    private String propertyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @NotNull
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @OneToMany(mappedBy = "property",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @Size(min = 1, max = 5, message = "A property must have between 1 and 5 images")
    private List<PropertyImage> images;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 15, fraction = 2)
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false, length = 20)
    @Builder.Default
    private PropertyType propertyType = PropertyType.HOUSE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false, length = 10)
    @Builder.Default
    private ListingType listingType = ListingType.SALE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PropertyStatus status = PropertyStatus.DRAFT;

    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private int bedrooms = 0;

    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private int bathrooms = 0;

    @DecimalMin("0.0")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "area_sqft", precision = 10, scale = 2)
    private BigDecimal areaSqft;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant deletedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant updatedAt;


    public enum PropertyType {
        HOUSE, APARTMENT, CONDO, VILLA, PLOT, COMMERCIAL
    }

    public enum ListingType {
        SALE, RENT
    }

    public enum PropertyStatus {
        DRAFT, AVAILABLE, SOLD, RENTED, PENDING
    }


    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = Instant.now();
    }
}