package com.restate.app.service;

import jakarta.persistence.criteria.*;
import com.restate.app.dto.property.*;
import com.restate.app.entity.Address;
import com.restate.app.entity.Property;
import com.restate.app.entity.Property.PropertyStatus;
import com.restate.app.entity.PropertyImage;
import com.restate.app.entity.User;
import com.restate.app.exception.address.AddressException;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.exception.property.PropertyException;
import com.restate.app.repository.AddressRepo;
import com.restate.app.repository.PropertyImageRepo;
import com.restate.app.repository.PropertyRepo;
import com.restate.app.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {
    private final PropertyImageRepo imageRepo;
    private final AddressRepo addressRepo;
    private final PropertyRepo propertyRepo;
    private final UserRepo userRepo;

    public PropertyResponse getPropertyById(String id) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> PropertyException.noPropertyFound());
        return mapToResponse(property);
    }

    public Page<PropertySummaryResponse> listProperties(PropertyFilterRequest filter, Pageable pageable) {
        Specification<Property> spec = withFilters(filter);
        Page<Property> properties = propertyRepo.findAll(spec, pageable);
        return properties.map(this::mapToSummaryResponse);
    }

    public PropertyResponse createProperty(CreateProperty property, String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> AuthException.noUserFound());
        Address address = addressRepo.findById(property.addressId())
                .orElseThrow(() -> AddressException.noAddressFound());
        Property createproperty = Property.builder()
                .title(property.title())
                .description(property.description())
                .owner(user)
                .address(address)
                .price(property.price())
                .propertyType(property.propertyType())
                .listingType(property.listingType())
                .bathrooms(property.bathrooms())
                .bedrooms(property.bedrooms())
                .areaSqft(property.areaSqft())
                .status(Property.PropertyStatus.DRAFT)
                .build();

        Property savedProperty = propertyRepo.save(createproperty);
        List<PropertyImage> images = property.images()
                .stream()
                .map(imgDto -> PropertyImage.builder()
                        .property(savedProperty)
                        .imageUrl(imgDto.imageUrl())
                        .isPrimary(imgDto.isPrimary())
                        .sortOrder(imgDto.sortOrder())
                        .build())
                .toList();

        boolean hasPrimary = images.stream().anyMatch(PropertyImage::isPrimary);
        if (!hasPrimary) {
            images.getFirst().setPrimary(true);
        }

        createproperty.setImages(images);

        return mapToResponse(savedProperty);
    }

    public PropertyResponse updateProperty(String id, UpdateProperty request, String email) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> PropertyException.noPropertyFound());

        if (!property.getOwner().getEmail().equals(email)) {
            throw PropertyException.unauthorized();
        }

        Address address = addressRepo.findById(request.addressId()).orElse(null);

        property.setTitle(request.title());
        property.setDescription(request.description());
        property.setPrice(request.price());
        property.setPropertyType(request.propertyType());
        property.setListingType(request.listingType());
        property.setStatus(request.status());
        property.setBedrooms(request.bedrooms());
        property.setBathrooms(request.bathrooms());
        property.setAreaSqft(request.areaSqft());
        property.setAddress(address);

        imageRepo.deleteAll(property.getImages());
        property.getImages().clear();

        List<PropertyImage> newImages = new ArrayList<>(request.images().stream()
                .map(imgDto -> PropertyImage.builder()
                        .property(property)
                        .imageUrl(imgDto.imageUrl())
                        .isPrimary(imgDto.isPrimary())
                        .sortOrder(imgDto.sortOrder())
                        .build())
                .toList());

        boolean hasPrimary = newImages.stream().anyMatch(PropertyImage::isPrimary);
        if (!hasPrimary && !newImages.isEmpty()) {
            newImages.getFirst().setPrimary(true);
        }

        property.getImages().addAll(newImages);

        Property updatedProperty = propertyRepo.save(property);
        return mapToResponse(updatedProperty);
    }

    public void deleteProperty(String id, String email) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> PropertyException.noPropertyFound());

        if (!property.getOwner().getEmail().equals(email)) {
            throw PropertyException.unauthorized();
        }

        property.softDelete();
        propertyRepo.save(property);
    }

    public Specification<Property> withFilters(PropertyFilterRequest filter) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            Join<Object, Object> addressJoin = root.join("address", JoinType.LEFT);

            predicates.add(cb.equal(root.get("isDeleted"), false));

            if (filter.city() != null && !filter.city().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(addressJoin.get("city")),
                        "%" + filter.city().toLowerCase() + "%"));
            }

            if (filter.state() != null && !filter.state().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(addressJoin.get("state")),
                        "%" + filter.state().toLowerCase() + "%"));
            }
            // ── Property type ─────────────────────────────────────
            if (filter.propertyType() != null) {
                predicates.add(cb.equal(root.get("propertyType"), filter.propertyType()));
            }

            // ── Listing type ──────────────────────────────────────
            if (filter.listingType() != null) {
                predicates.add(cb.equal(root.get("listingType"), filter.listingType()));
            }

            // ── Status — default to AVAILABLE if not provided ─────
            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            } else {
                predicates.add(cb.equal(root.get("status"), PropertyStatus.AVAILABLE));
            }

            // ── Price range ───────────────────────────────────────
            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice()));
            }

            // ── Bedrooms ──────────────────────────────────────────
            if (filter.minBedrooms() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bedrooms"), filter.minBedrooms()));
            }

            // ── Bathrooms ─────────────────────────────────────────
            if (filter.minBathrooms() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bathrooms"), filter.minBathrooms()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private PropertyResponse mapToResponse(Property property) {
        PropertyResponse.PropertyOwnerResponse ownerResponse = new PropertyResponse.PropertyOwnerResponse(
                property.getOwner().getId(),
                property.getOwner().getFirstName(),
                property.getOwner().getLastName(),
                property.getOwner().getEmail(),
                property.getOwner().getAvatarUrl(),
                property.getOwner().getPhoneNumber());

        PropertyResponse.PropertyAddressResponse addressResponse = new PropertyResponse.PropertyAddressResponse(
                property.getAddress().getAddressId(),
                property.getAddress().getAddress(),
                property.getAddress().getPlotNumber(),
                property.getAddress().getFloor(),
                property.getAddress().getLandmark(),
                property.getAddress().getCity(),
                property.getAddress().getState(),
                property.getAddress().getCountry(),
                property.getAddress().getPinCode(),
                property.getAddress().getLatitude(),
                property.getAddress().getLongitude());

        List<PropertyResponse.PropertyImageResponse> imageResponses = property.getImages().stream()
                .map(img -> new PropertyResponse.PropertyImageResponse(
                        img.getId(),
                        img.getImageUrl(),
                        img.isPrimary(),
                        img.getSortOrder()))
                .toList();

        return new PropertyResponse(
                property.getPropertyId(),
                property.getTitle(),
                property.getDescription(),
                property.getPrice(),
                property.getPropertyType(),
                property.getListingType(),
                property.getStatus(),
                property.getBedrooms(),
                property.getBathrooms(),
                property.getAreaSqft(),
                property.getCreatedAt(),
                property.getUpdatedAt(),
                ownerResponse,
                addressResponse,
                imageResponses);
    }

    private PropertySummaryResponse mapToSummaryResponse(Property property) {
        String primaryImageUrl = property.getImages().stream()
                .filter(PropertyImage::isPrimary)
                .map(PropertyImage::getImageUrl)
                .findFirst()
                .orElse(property.getImages().isEmpty() ? null : property.getImages().getFirst().getImageUrl());

        String city = property.getAddress() != null ? property.getAddress().getCity() : null;
        String state = property.getAddress() != null ? property.getAddress().getState() : null;

        return new PropertySummaryResponse(
                property.getPropertyId(),
                property.getTitle(),
                property.getPrice(),
                property.getPropertyType(),
                property.getListingType(),
                property.getStatus(),
                property.getBedrooms(),
                property.getBathrooms(),
                property.getAreaSqft(),
                property.getCreatedAt(),
                city,
                state,
                primaryImageUrl);
    }
}
