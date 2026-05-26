package com.restate.app.controller;

import com.restate.app.dto.userDevice.UserDeviceRequest;
import com.restate.app.entity.User;
import com.restate.app.service.UserDeviceService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/fcm")
@RequiredArgsConstructor
public class UserDeviceController {

    final private UserDeviceService userDeviceService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Boolean>> addDevice(@Validated @RequestBody UserDeviceRequest userDevice, @AuthenticationPrincipal User user){
        Boolean isRegister = userDeviceService.registerUserDevice(userDevice, user);
        return ApiResponse.ok(isRegister);
    }

    @DeleteMapping("/unregister")
    public ResponseEntity<ApiResponse<Boolean>> removeDevice(@Validated @RequestBody UserDeviceRequest userDevice){
        boolean result = userDeviceService.removeUserDevice(userDevice);
        return ApiResponse.ok(result);
    }
}
