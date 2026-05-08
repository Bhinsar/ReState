package com.restate.app.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.restate.app.dto.auth.LoginRequest;
import com.restate.app.dto.auth.RegisterRequest;
import com.restate.app.dto.auth.RegisterUserRequest;
import com.restate.app.entity.User;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.repository.UserRepo;
import com.restate.app.utils.OtpUtil;
import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.Null;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final OtpUtil otpUtil;
    private final EmailService emailService;
    @Value("${google.client.id}")
    private String clientId;

    private GoogleIdTokenVerifier verifier;  // not final, not initialized here

    @PostConstruct  // runs AFTER @Value is injected
    public void init() {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance()
        ).setAudience(Collections.singletonList(clientId)).build();
        log.info("GoogleIdTokenVerifier initialized with clientId: {}", clientId);
    }

    public User register(RegisterRequest registerRequest) {
        if (userRepo.findByEmail(registerRequest.email()).isPresent()) {
            throw AuthException.emailAlreadyExists();
        }

        String hashPassword = passwordEncoder.encode(registerRequest.password());

        User user = User.builder()
                .firstName(registerRequest.firstName())
                .lastName(registerRequest.lastName())
                .countryCode(registerRequest.countryCode())
                .phoneNumber(registerRequest.phoneNumber())
                .dateOfBirth(registerRequest.dateOfBirth())
                .email(registerRequest.email())
                .password(hashPassword)
                .build();

        String otp = otpUtil.generateOtp();
        emailService.sendOtpEmail(user.getEmail(), user.getFirstName(), otp);


        log.info("Attempting to save user to DB...");
        return userRepo.save(user);

    }

    public User login(LoginRequest loginRequest) {
        User user = userRepo.findByEmail(loginRequest.email())
                .orElseThrow(() -> AuthException.invalidCredentials());

        if (user == null) {
            throw AuthException.invalidCredentials();
        }

        if (user.getPassword() == null) {
            throw AuthException.invalidCredentials();
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );


        if (user.getRegistrationStep() == User.RegisterStep.REGISTERED) {
            String otp = otpUtil.generateOtp();
            emailService.sendOtpEmail(user.getEmail(), user.getFirstName(), otp);
        }

        return user;
    }

    public User googleLogin(String idTokenStr) throws Exception {
        GoogleIdToken idToken = verifier.verify(idTokenStr);
        log.info(idTokenStr);
        if (idToken == null) throw AuthException.invalidToken();
        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();


        User exitedUser = userRepo.findByEmail(email).orElse(null);

        if (exitedUser != null) {
            return exitedUser;
        }

        String avatarUrl = (String) payload.get("picture");
        String givenName = (String) payload.get("given_name");
        String familyName = (String) payload.get("family_name");

        User createUser = User.builder()
                .firstName(givenName)
                .lastName(familyName)
                .email(email)
                .avatarUrl(avatarUrl)
                .registrationStep(User.RegisterStep.GMAIL)
                .build();

        return userRepo.save(createUser);
    }

    public User regiseruser(RegisterUserRequest request, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> AuthException.tokenExpired());

        user.setCountryCode(request.countryCode());
        user.setPhoneNumber(request.phoneNumber());
        user.setDateOfBirth(request.dateOfBirth());
        user.setRegistrationStep(User.RegisterStep.EMAIL_VERIFIED);

        return userRepo.save(user);

    }
}
