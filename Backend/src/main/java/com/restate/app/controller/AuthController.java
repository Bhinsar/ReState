package com.restate.app.controller;

import com.restate.app.dto.auth.*;
import com.restate.app.entity.User;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.repository.UserRepo;
import com.restate.app.service.AuthService;
import com.restate.app.service.JWTService;
import com.restate.app.utils.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JWTService jwtService;
    private final UserRepo userRepo;

    private ResponseEntity<ApiResponse<AuthResponse>> buildAuthResponse(
            User user, String clientType, HttpServletResponse response, boolean isNewRegistration) {

        String accessToken = jwtService.generate(user, 1000L * 60 * 60 * 24);
        String refreshToken = jwtService.generate(user, 1000L * 60 * 60 * 24 * 30);

        // Dynamic message and status
        String message = isNewRegistration ? "User Created Successfully" : "Login Successful";
        AuthResponse authData = "mobile".equals(clientType)
                ? AuthResponse.forMobile(user, accessToken, refreshToken)
                : AuthResponse.forWeb(user);

        if (!"mobile".equals(clientType)) {
            addCookie(response, accessToken, refreshToken, user.getRegistrationStep());
        }

        // Logic to return 201 for Register and 200 for Login
        return isNewRegistration
                ? ApiResponse.created(message, authData)
                : ApiResponse.ok(message, authData);
    }

    private void addCookie(HttpServletResponse response, String accessToken, String refreshToken, User.RegisterStep step) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofDays(1))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        ResponseCookie stepCookie = ResponseCookie.from("step", String.valueOf(step))
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, stepCookie.toString());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Validated @RequestBody RegisterRequest registerRequest,
                                                              @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType,
                                                              HttpServletResponse response) {

        LocalDate dob = registerRequest.dateOfBirth()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        long age = ChronoUnit.YEARS.between(dob, LocalDate.now());

        if (age < 18)
            return ApiResponse.badRequest("Age must be 18 or above");

        User savedUser = authService.register(registerRequest);

        return buildAuthResponse(savedUser, clientType, response, true);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Validated @RequestBody LoginRequest loginRequest,
                                                           @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType,
                                                           HttpServletResponse response) {
        User savedUser = authService.login(loginRequest);


        return buildAuthResponse(savedUser, clientType, response, false);
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<RefreshResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody(required = false) RefreshRequest refreshRequest,
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType) {

        String refreshToken = null;

        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null && refreshRequest != null) {
            refreshToken = refreshRequest.refreshToken();

        }

        log.info("refreshToken: " + refreshToken);

        if (refreshToken == null)
            throw AuthException.tokenExpired();

        String email = jwtService.extractUsername(refreshToken);
        if (email == null || jwtService.isTokenExpired(refreshToken))
            throw AuthException.tokenExpired();

        User user = userRepo.findByEmail(email)
                .orElseThrow(AuthException::tokenExpired);

        // Generate new tokens
        String newAccessToken = jwtService.generate(user, 1000L * 60 * 60 * 24);
        String newRefreshToken = jwtService.generate(user, 1000L * 60 * 60 * 24 * 30);

        if ("mobile".equals(clientType)) {
            // Mobile → return tokens in response body
            return ApiResponse.ok("Token refreshed successfully",
                    RefreshResponse.forMobile(newAccessToken, newRefreshToken));
        } else {
            // Web → set new cookies, return empty data
            addCookie(response, newAccessToken, newRefreshToken, user.getRegistrationStep());
            return ApiResponse.ok("Token refreshed successfully", RefreshResponse.forWeb());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();

        ResponseCookie stepCookie = ResponseCookie.from("step", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, stepCookie.toString());

        String message = "Successfully lout the user";

        return ApiResponse.ok(message);

    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> goggleLogin(@Validated @RequestBody GoogleAuthRequest request, HttpServletResponse response, @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType) throws Exception {
        User user = authService.googleLogin(request.id_token());
        
        return buildAuthResponse(user, clientType, response, false);
        
    }


}