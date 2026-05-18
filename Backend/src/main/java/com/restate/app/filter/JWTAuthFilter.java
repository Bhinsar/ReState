package com.restate.app.filter;

import com.restate.app.entity.User;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.repository.UserRepo;
import com.restate.app.service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JWTAuthFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final UserRepo userRepo;
    private final RedisTemplate<String, Object> redisObjectTemplate;
    private final HandlerExceptionResolver handlerExceptionResolver;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
//        logger.info("req url: " + requestURI);

        String token = extractToken(request);

        // No token → just continue (do NOT throw anything here)
        if (token == null) {
//            logger.info("No token found");
            filterChain.doFilter(request, response);
            return;
        }

        // Token present → try to validate it
        try {
            String email = jwtService.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = (User) redisObjectTemplate.opsForValue().get("user_cache:" + email);
                // 2. If not in Redis, fetch from DB and save to Redis
                if (user == null) {
                    user = userRepo.findByEmail(email).orElse(null);
                    if (user != null) {
                        // Cache for 1 hour to keep it fresh but reduce DB hits
                        redisObjectTemplate.opsForValue().set("user_cache:" + email, user, Duration.ofHours(1));
                    }
                }

                // 3. Validate and Set Security Context
                if (user != null && user.isEnabled() && !jwtService.isTokenExpired(token)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    // Clear context if user is deleted or token is bad
                    SecurityContextHolder.clearContext();
                    throw AuthException.tokenExpired();
                }
            }
        } catch (Exception e) {
//            logger.error("JWT processing error:"+e);
            SecurityContextHolder.clearContext();
            handlerExceptionResolver.resolveException(request, response, null, e);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // Header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // Cookie
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> "accessToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}