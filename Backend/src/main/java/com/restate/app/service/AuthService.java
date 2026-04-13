package com.restate.app.service;

import com.restate.app.dto.auth.LoginRequest;
import com.restate.app.dto.auth.RegisterRequest;
import com.restate.app.entity.User;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.repository.UserRepo;
import com.restate.app.utils.OtpUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final OtpUtil otpUtil;
    private final EmailService emailService;

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
        emailService.sendOtpEmail(user.getEmail(), user.getFirstName(),otp);


        log.info("Attempting to save user to DB...");
        return userRepo.save(user);

    }

    public User login(LoginRequest loginRequest){

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        User user = userRepo.findByEmail(loginRequest.email()).orElse(null);

        if(user == null){
            throw AuthException.invalidCredentials();
        }

        if(user.getRegistrationStep() == User.RegisterStep.REGISTERED){
            String otp = otpUtil.generateOtp();
            emailService.sendOtpEmail(user.getEmail(), user.getFirstName(),otp);
        }

        return user;
    }
}
