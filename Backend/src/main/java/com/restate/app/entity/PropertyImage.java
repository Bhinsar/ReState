package com.restate.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Builder
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "property_images")
@EntityListeners(AuditingEntityListener.class)
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "image_id", updatable = false, nullable = false)
    private String imageId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @NotNull
    private Property property;

    @NotBlank(message = "Image URL cannot be blank")
    @Size(max = 500, message = "Image URL too long")
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Builder.Default
    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @Min(value = 0, message = "Sort order cannot be negative")
    @Max(value = 4, message = "Sort order cannot exceed 4")
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @PrePersist
    private void validateSortOrder() {
        if (this.sortOrder < 0 || this.sortOrder > 4) {
            throw new IllegalStateException("Sort order must be between 0 and 4");
        }
    }

}