package com.restate.app.controller;

import com.restate.app.dto.property.CreateProperty;
import com.restate.app.dto.property.PropertyFilterRequest;
import com.restate.app.dto.property.PropertyResponse;
import com.restate.app.dto.property.PropertySummaryResponse;
import com.restate.app.dto.property.UpdateProperty;
import com.restate.app.service.PropertyService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
public class PropertyController {
    private final PropertyService propertyService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
            @Validated @RequestBody CreateProperty request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PropertyResponse res = propertyService.createProperty(request, email);
        return ApiResponse.created(res);
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

        Page<PropertySummaryResponse> page = propertyService.listProperties(filter, pageable);

        return ApiResponse.pagedOk("Properties fetched successfully", page, page.getContent());
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
}
