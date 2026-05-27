package com.restate.app.controller;

import com.restate.app.dto.auth.AuthResponse;
import com.restate.app.dto.auth.Otp;
import com.restate.app.entity.User;
import com.restate.app.service.OtpService;
import com.restate.app.utils.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
public class OtpController {
    
    @Value("${project.frontendURL}")
    private String frontendURL;

    private final OtpService otpService;

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@RequestBody Otp otpReq, @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType,HttpServletResponse response) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = otpService.verifyEmail(otpReq.otp(), email);

        String message = "Email verified successfully";
        AuthResponse data = AuthResponse.forWeb(user);
        String domainName = URI.create(frontendURL).getHost();
        if (!"mobile".equals(clientType)) {
            ResponseCookie stepCookie = ResponseCookie.from("step", String.valueOf(user.getRegistrationStep()))
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Lax")
                    .domain(domainName)
                    .path("/")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, stepCookie.toString());
        }

        return ApiResponse.ok(message, data);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        otpService.resendOtp(email);

        String message = "Verification email resent successfully";

        return ApiResponse.ok(message);
    }
}
