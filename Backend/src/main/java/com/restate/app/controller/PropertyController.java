package com.restate.app.controller;

import com.google.firebase.messaging.FirebaseMessagingException;
import com.restate.app.dto.property.*;
import com.restate.app.entity.User;
import com.restate.app.service.NotificationService;
import com.restate.app.service.PropertyService;
import com.restate.app.service.UserDeviceService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;

import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/properties")
@Slf4j
@RequiredArgsConstructor
public class PropertyController {
    private final PropertyService propertyService;
    private final NotificationService notificationService;

    @PostMapping()
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
            @Validated @RequestBody CreateProperty request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PropertyResponse res = propertyService.createProperty(request, email);
        return ApiResponse.created(res);
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<PropertySummaryResponse>>> listTrendingProperties(
            @ModelAttribute PropertyFilterRequest filter,
            Pageable pageable) {

        Page<PropertySummaryResponse> page = propertyService.listProperties(filter, pageable,  true);
        return ApiResponse.pagedOk("Properties fetched successfully", page, page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> getPropertyById(@PathVariable String id) {
        PropertyResponse res = propertyService.getPropertyById(id);
        return ApiResponse.ok(res);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertySummaryResponse>>> listProperties(
            @ModelAttribute PropertyFilterRequest filter,
            Pageable pageable) {

        Page<PropertySummaryResponse> page = propertyService.listProperties(filter, pageable, false);
        return ApiResponse.pagedOk("Properties fetched successfully", page, page.getContent());
    }


    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<PropertySummaryResponse>>> getMyProperties(
            @AuthenticationPrincipal User user,
            @ModelAttribute PropertyFilterRequest filter,
            Pageable pageable) {
        Page<PropertySummaryResponse> page = propertyService.getMyProperties(user.getId(),filter, pageable);
        return ApiResponse.pagedOk("Properties fetched successfully", page, page.getContent());
    }

    @GetMapping("/me/metrics")
    public ResponseEntity<ApiResponse<PropertyMetrics>> getMyMatrics(@AuthenticationPrincipal User user){
        PropertyMetrics metrics = propertyService.getMyMatrics(user.getId());
        return ApiResponse.ok(metrics);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
            @PathVariable String id,
            @Validated @RequestBody UpdateProperty request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PropertyResponse res = propertyService.updateProperty(id, request, email);
        return ApiResponse.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        propertyService.deleteProperty(id, email);
        return ApiResponse.ok(null);
    }

    @PostMapping("/{propertyId}/interest")
    public ResponseEntity<ApiResponse<Void>> expressInterest(
            @PathVariable String propertyId,
            @AuthenticationPrincipal User user) throws FirebaseMessagingException {

        notificationService.notifyPropertyInterset(propertyId, user);

        return ApiResponse.ok("Interest expressed");
    }
}
