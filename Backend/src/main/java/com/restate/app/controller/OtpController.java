package com.restate.app.controller;

import com.restate.app.dto.auth.AuthResponse;
import com.restate.app.dto.auth.Otp;
import com.restate.app.entity.User;
import com.restate.app.service.OtpService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@RequestBody Otp otpReq) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = otpService.verifyEmail(otpReq.otp(), email);

        String message = "Email verified successfully";
        AuthResponse data = AuthResponse.forWeb(user);

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
