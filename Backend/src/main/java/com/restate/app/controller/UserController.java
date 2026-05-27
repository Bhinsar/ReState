package com.restate.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.RedisTemplate;

import com.restate.app.dto.user.ChangePasswordRequest;
import com.restate.app.dto.user.UpdateUserRequest;
import com.restate.app.dto.user.UserResponse;
import com.restate.app.entity.User;
import com.restate.app.service.JWTService;
import com.restate.app.service.UserService;
import com.restate.app.utils.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    @Value("${project.frontendURL}")
    private String frontendURL;

    private final UserService userService;
    private final JWTService jwtService;
    private final RedisTemplate<String, Object> redisObjectTemplate;

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
    public ResponseEntity<ApiResponse<Void>> deleteMe(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType,
            HttpServletRequest request,
            HttpServletResponse response) {
        userService.deleteMe(user);
        if (!"mobile".equals(clientType)) {
            // Blocklist the current accessToken so it cannot be reused
            if (request.getCookies() != null) {
                Arrays.stream(request.getCookies())
                        .filter(c -> "accessToken".equals(c.getName()))
                        .map(Cookie::getValue)
                        .findFirst()
                        .ifPresent(token -> {
                            try {
                                long remainingMs = jwtService.getExpirationMs(token);
                                if (remainingMs > 0) {
                                    redisObjectTemplate.opsForValue()
                                            .set("token_blocklist:" + token, "deleted",
                                                    Duration.ofMillis(remainingMs));
                                }
                            } catch (Exception ignored) {
                                // Token already expired — nothing to blocklist
                            }
                        });
            }
            AuthController.clearAuthCookies(response);
        }

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
