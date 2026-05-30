package com.restate.app.filter;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class WebSocketHandshakeInterceptor
        implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        // Cast to get access to cookies
        if (request instanceof ServletServerHttpRequest servletRequest) {

            HttpServletRequest httpRequest =
                    servletRequest.getServletRequest();

            // Extract JWT from cookie
            String token = extractTokenFromCookie(httpRequest);

            if (token != null) {
                // Store in session attributes
                // WebSocketAuthInterceptor reads from here
                attributes.put("accessToken", token);
                return true;    // allow connection
            }

            // No token found — reject the handshake
            return false;
        }

        return false;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // nothing needed here
    }

    private String extractTokenFromCookie(
            HttpServletRequest request) {

        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        for (Cookie cookie : cookies) {
            // Must match your cookie name exactly
            if ("accessToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}