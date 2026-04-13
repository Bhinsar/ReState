package com.restate.app.service;

import com.restate.app.entity.User;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.repository.UserRepo;
import com.restate.app.utils.OtpUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final StringRedisTemplate redisTemplate;
    private final UserRepo userRepo;
    private final OtpUtil otpUtil;
    private  final EmailService emailService;

    public User verifyEmail(String otp, String email){
        String key = "otp:" + email;

        String validOtp = redisTemplate.opsForValue().get(key);

        if(validOtp == null || !validOtp.equals(otp)) throw AuthException.otpExpired();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> AuthException.noUserFound());

        user.setRegistrationStep(User.RegisterStep.EMAIL_VERIFIED);

        userRepo.save(user);

        redisTemplate.delete(key);
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        return user;
    }

    public void resendOtp(String email) {
        String otp = otpUtil.generateOtp();
        User user = userRepo.findByEmail(email).orElseThrow(()->AuthException.noUserFound());
        emailService.sendOtpEmail(user.getEmail(),user.getFirstName(), otp);
    }
}
