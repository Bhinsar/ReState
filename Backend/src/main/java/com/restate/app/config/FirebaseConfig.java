package com.restate.app.config;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

@Configuration
public class FirebaseConfig {

    @Value("${FIREBASE_CONFIG_JSON:}")
    private String firebaseConfigJson;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        GoogleCredentials credentials;

        if (firebaseConfigJson == null || firebaseConfigJson.isBlank()) {
            // Local — read from file
            ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
            credentials = GoogleCredentials.fromStream(resource.getInputStream());
        } else {
            // Production — handling raw JSON or Base64 encoded JSON safely
            byte[] jsonBytes;
            String cleanedStr = firebaseConfigJson.trim();

            if (!cleanedStr.startsWith("{")) {
                // Strip any accidental wrapping env quotes if present
                if (cleanedStr.startsWith("\"") && cleanedStr.endsWith("\"")) {
                    cleanedStr = cleanedStr.substring(1, cleanedStr.length() - 1);
                }
                jsonBytes = Base64.getDecoder().decode(cleanedStr);
            } else {
                jsonBytes = cleanedStr.getBytes(StandardCharsets.UTF_8);
            }

            InputStream stream = new ByteArrayInputStream(jsonBytes);
            credentials = GoogleCredentials.fromStream(stream);
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.initializeApp(options);
        }

        return FirebaseApp.getInstance();
    }
}