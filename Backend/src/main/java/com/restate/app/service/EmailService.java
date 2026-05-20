package com.restate.app.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;
    @Value("${project.frontendURL}")
    private String frontendURL;

    private String loadTemplate(String filename) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/email/" + filename);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
    private void send(String to, String subject, String htmlBody)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            String body = loadTemplate("welcome.html")
                    .replace("{{name}}", name);

            send(toEmail, "Welcome to Restate, " + name + "!", body);

        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(String toEmail, String name, String otp) {
        try {

            String subject  =  "Your Restate OTP code";

            String body = loadTemplate("otp.html")
                    .replace("{{otp}}", otp)
                    .replace("{{name}}", name);


            send(toEmail, subject, body);

            String key = "otp:" + toEmail;

            // Store for 5 minutes. If they don't verify by then, Redis deletes it.
            redisTemplate.opsForValue().set(key, otp, 5, TimeUnit.MINUTES);

            String validOtp = redisTemplate.opsForValue().get(key);

            log.info("otp set for key"+ key+" "+ validOtp);


        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }
    @Async
    public void ResetPassword(String toEmail, String token) {
        try {
            String subject  =  "Reset your password";

            String body = loadTemplate("reset-password-otp.html")
                    .replace("{{link}}", frontendURL+"/reset-password/"+token);

            String key = "forgetPass:" + toEmail;
            redisTemplate.opsForValue().set(key, token, 60, TimeUnit.MINUTES);
            send(toEmail, subject, body);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }
}
