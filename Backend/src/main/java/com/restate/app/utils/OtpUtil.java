package com.restate.app.utils;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpUtil {
    public String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(999999));
    }
}
