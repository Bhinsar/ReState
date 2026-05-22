package com.restate.app.service;

import jakarta.persistence.criteria.*;
import com.restate.app.dto.property.*;
import com.restate.app.entity.Address;
import com.restate.app.entity.Property;
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
import lombok.extern.slf4j.Slf4j;
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
        property.setViewCount(property.getViewCount() + 1);
        propertyRepo.save(property);
        return mapToResponse(property);
    }

    public Page<PropertySummaryResponse> listProperties(PropertyFilterRequest filter, Pageable pageable, boolean isTrending) {
        Specification<Property> spec = withFilters(filter, false,  isTrending);
        Page<Property> properties = propertyRepo.findAll(spec, pageable);
        return properties.map(this::mapToSummaryResponse);
    }

    public Page<PropertySummaryResponse> getMyProperties(String userId, PropertyFilterRequest filter, Pageable pageable) {
        Specification<Property> spec = withFilters(filter, true, false).and((root, query, cb) -> cb.equal(root.get("owner").get("id"), userId));
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
            images.get(0).setPrimary(true);
        }
        imageRepo.saveAll(images);
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
            newImages.get(0).setPrimary(true);
        }

        property.getImages().addAll(newImages);

        imageRepo.saveAll(newImages);
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

    private Specification<Property> withFilters(PropertyFilterRequest filter, boolean isOwnerView, boolean isTrending) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();
            List<Order> orders = new ArrayList<>();

            Join<Object, Object> addressJoin = root.join("address", JoinType.LEFT);

            predicates.add(cb.equal(root.get("isDeleted"), false));

            if (filter.city() != null && !filter.city().isBlank()) {
                predicates.add(cb.like(cb.lower(addressJoin.get("city")),
                        "%" + filter.city().toLowerCase() + "%"));
            }

            if (filter.state() != null && !filter.state().isBlank()) {
                predicates.add(cb.like(cb.lower(addressJoin.get("state")),
                        "%" + filter.state().toLowerCase() + "%"));
            }

            if (filter.propertyType() != null) {
                predicates.add(cb.equal(root.get("propertyType"), filter.propertyType()));
            }

            if (filter.listingType() != null) {
                predicates.add(cb.equal(root.get("listingType"), filter.listingType()));
            }

            if (isOwnerView) {
                if (filter.status() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.status()));
                }
            } else {
                predicates.add(cb.equal(root.get("status"), Property.PropertyStatus.AVAILABLE));
            }

            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice()));
            }
            if (filter.minBedrooms() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bedrooms"), filter.minBedrooms()));
            }
            if (filter.minBathrooms() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bathrooms"), filter.minBathrooms()));
            }

            if (filter.search() != null && !filter.search().isBlank()) {
                String searchTerm = "%" + filter.search().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), searchTerm),
                        cb.like(cb.lower(root.get("description")), searchTerm),
                        cb.like(cb.lower(addressJoin.get("city")), searchTerm)
                ));
            }

            if (!isOwnerView && filter.latitude() != null && filter.longitude() != null) {
                final double EARTH_RADIUS_KM = 6371.0;
                final double userLat = Math.toRadians(filter.latitude());
                final double userLon = Math.toRadians(filter.longitude());

                Expression<Double> propLatRad = cb.function("radians", Double.class,
                        addressJoin.get("latitude").as(Double.class));
                Expression<Double> propLonRad = cb.function("radians", Double.class,
                        addressJoin.get("longitude").as(Double.class));

                Expression<Double> dLat = cb.diff(propLatRad, cb.literal(userLat));
                Expression<Double> dLon = cb.diff(propLonRad, cb.literal(userLon));

                Expression<Double> sinDLatHalf = cb.function("sin", Double.class,
                        cb.quot(dLat, cb.literal(2.0)).as(Double.class));
                Expression<Double> sinDLonHalf = cb.function("sin", Double.class,
                        cb.quot(dLon, cb.literal(2.0)).as(Double.class));

                Expression<Double> cosUserLat = cb.literal(Math.cos(userLat));
                Expression<Double> cosPropLat = cb.function("cos", Double.class, propLatRad);

                Expression<Double> aExpr = cb.sum(
                        cb.prod(sinDLatHalf, sinDLatHalf),
                        cb.prod(cb.prod(cosUserLat, cosPropLat),
                                cb.prod(sinDLonHalf, sinDLonHalf)).as(Double.class)
                ).as(Double.class);

                Expression<Double> distanceKm = cb.prod(
                        cb.literal(2.0 * EARTH_RADIUS_KM),
                        cb.function("assign", Double.class,
                                cb.function("sqrt", Double.class, aExpr))
                ).as(Double.class);


                orders.add(cb.asc(distanceKm));
            }

            if (isTrending) {
                orders.add(cb.desc(root.get("viewCount")));
            }

            orders.add(cb.desc(root.get("createdAt")));

            // ✅ Guard: skip orderBy and distinct on COUNT queries
            boolean isCountQuery = Long.class.equals(query.getResultType())
                    || long.class.equals(query.getResultType());

            if (!isCountQuery) {
                // query.distinct(true); // Causes Postgres error when ordering by computed distance
                query.orderBy(orders);
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
                property.getOwner().getAvatarUrl());

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
                        img.getImageId(),
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
                imageResponses,
                property.getViewCount());
    }

    private PropertySummaryResponse mapToSummaryResponse(Property property) {
        String primaryImageUrl = property.getImages().stream()
                .filter(PropertyImage::isPrimary)
                .map(PropertyImage::getImageUrl)
                .findFirst()
                .orElse(property.getImages().isEmpty() ? null : property.getImages().get(0).getImageUrl());

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

    public PropertyMetrics getMyMatrics(String id) {
        return propertyRepo.findMetricsByUserId(id);
    }
}
