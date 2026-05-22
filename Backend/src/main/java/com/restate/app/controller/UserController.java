package com.restate.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restate.app.dto.user.ChangePasswordRequest;
import com.restate.app.dto.user.UpdateUserRequest;
import com.restate.app.dto.user.UserResponse;
import com.restate.app.entity.User;
import com.restate.app.service.UserService;
import com.restate.app.utils.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal User user) {
        UserResponse res = userService.getMe(user);
        return ApiResponse.ok(res);
    }

    
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(
            @AuthenticationPrincipal User user,
            @Validated @RequestBody UpdateUserRequest request) {
        UserResponse res = userService.updateMe(user, request);
        return ApiResponse.ok("Profile updated successfully", res);
    }

   
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMe(@AuthenticationPrincipal User user) {
        userService.deleteMe(user);
        return ApiResponse.ok("Account deleted successfully");
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Validated @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user, request);
        return ApiResponse.ok("Password changed successfully");
    }
}
