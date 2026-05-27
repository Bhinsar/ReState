package com.restate.app.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    // Separate bucket store per endpoint pattern, keyed by device fingerprint
    private final Map<String, Map<String, Bucket>> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws IOException, ServletException {

        String deviceKey = resolveDeviceKey(request);
        String path      = request.getRequestURI();

        Bucket bucket = resolveBucket(deviceKey, path);

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining",
                    String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitSeconds));

            Map<String, Object> body = Map.of(
                    "success",   false,
                    "status",    429,
                    "message",   "Too many requests — please try again in " + waitSeconds + " seconds",
                    "timestamp", Instant.now().toString()
            );
            new ObjectMapper().writeValue(response.getOutputStream(), body);
        }
    }

    private Bucket resolveBucket(String deviceKey, String path) {
        String pattern = resolvePattern(path);
        // One map per endpoint pattern, one bucket per device per pattern
        return buckets
                .computeIfAbsent(pattern, k -> new ConcurrentHashMap<>())
                .computeIfAbsent(deviceKey, k -> newBucket(pattern));
    }

    private Bucket newBucket(String pattern) {
        return switch (pattern) {
            case "login"    -> Bucket.builder()
                    .addLimit(Bandwidth.builder()
                            .capacity(5)
                            .refillIntervally(5, Duration.ofMinutes(15))
                            .build())
                    .build();

            case "register" -> Bucket.builder()
                    .addLimit(Bandwidth.builder()
                            .capacity(3)
                            .refillIntervally(3, Duration.ofHours(1))
                            .build())
                    .build();

            case "otp"      -> Bucket.builder()
                    .addLimit(Bandwidth.builder()
                            .capacity(3)
                            .refillIntervally(3, Duration.ofMinutes(10))
                            .build())
                    .build();

            default         -> Bucket.builder()
                    .addLimit(Bandwidth.builder()
                            .capacity(100)
                            .refillIntervally(100, Duration.ofHours(3))
                            .build())
                    .build();
        };
    }

    private String resolvePattern(String path) {
        if (path.contains("/api/v1/auth/login"))      return "login";
        if (path.contains("/api/v1/auth/register"))   return "register";
        if (path.contains("/api/v1/otp/resend-otp"))  return "otp";
        return "default";
    }

    /**
     * Resolves a stable, per-device identifier for rate limiting.
     *
     * Strategy (in priority order):
     * 1. X-Device-ID header — a UUID that the client (mobile app or browser) generates
     *    once, stores locally (SharedPreferences / localStorage), and sends on every request.
     *    This is the most accurate: two phones on the same WiFi have different IDs.
     *
     * 2. Fallback — SHA-256(User-Agent + IP).  Different devices behind the same router
     *    almost always have different User-Agent strings, so this still separates them
     *    while remaining opaque (no raw PII stored as the key).
     */
    private String resolveDeviceKey(HttpServletRequest request) {
        // 1. Prefer explicit device ID sent by the client
        String deviceId = request.getHeader("X-Device-ID");
        if (deviceId != null && !deviceId.isBlank()) {
            // Prefix so it never accidentally collides with a hashed fallback key
            return "dev:" + deviceId.trim();
        }

        // 2. Fallback: hash(User-Agent + real IP)
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) userAgent = "unknown-agent";
        String ip = getClientIp(request);

        return "fp:" + sha256(userAgent + "|" + ip);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed to exist in every JVM — this never throws
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
