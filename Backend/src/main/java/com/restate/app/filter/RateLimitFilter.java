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
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    // Separate bucket store per endpoint pattern
    private final Map<String, Map<String, Bucket>> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws IOException, ServletException {

        String ip   = getClientIp(request);
        String path = request.getRequestURI();

        Bucket bucket = resolveBucket(ip, path);

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Add remaining requests info to response headers
            response.addHeader("X-Rate-Limit-Remaining",
                    String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            // Rate limit exceeded
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

    private Bucket resolveBucket(String ip, String path) {
        String pattern = resolvePattern(path);
        // One map per endpoint pattern, one bucket per IP per pattern
        return buckets
                .computeIfAbsent(pattern, k -> new ConcurrentHashMap<>())
                .computeIfAbsent(ip, k -> newBucket(pattern));
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

            default         -> Bucket.builder()  // all other endpoints
                    .addLimit(Bandwidth.builder()
                            .capacity(100)
                            .refillIntervally(100, Duration.ofHours(3))
                            .build())
                    .build();
        };
    }

    private String resolvePattern(String path) {
        if (path.contains("/api/v1/auth/login"))    return "login";
        if (path.contains("/api/v1/auth/register")) return "register";
        if (path.contains("/api/v1/otp/resend-otp"))      return "otp";
        return "default";
    }

    private String getClientIp(HttpServletRequest request) {
        // Check for IP behind proxy/load balancer first
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim(); // first IP in chain is real client
        }
        return request.getRemoteAddr();
    }
}
