package com.restate.app.controller;

import com.restate.app.dto.address.AddressRequest;
import com.restate.app.dto.address.AddressResponse;
import com.restate.app.service.AddressService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @Validated @RequestBody AddressRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AddressResponse res = addressService.createAddress(request, email);
        return ApiResponse.created(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AddressResponse res = addressService.getAddressById(id, email);
        return ApiResponse.ok(res);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAllAddresses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<AddressResponse> res = addressService.getAllAddresses(email);
        return ApiResponse.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable String id,
            @Validated @RequestBody AddressRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AddressResponse res = addressService.updateAddress(id, request, email);
        return ApiResponse.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        addressService.deleteAddress(id, email);
        return ApiResponse.ok(null);
    }
}
