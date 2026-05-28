package com.restate.app.filter;

import com.restate.app.exception.auth.AuthException;
import com.restate.app.service.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JWTService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor = MessageHeaderAccessor
                .getAccessor(message, StompHeaderAccessor.class);

        // Only check on CONNECT — not every message
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {

            String token = extractToken(accessor);

            // FIX 2: Guard against missing tokens
            if (token != null) {
                try {
                    String email = jwtService.extractUsername(token);

                    // FIX 1: Added '!' so we only allow non-expired tokens
                    if (email != null && !jwtService.isTokenExpired(token)) {

                        // Attach user identity to WebSocket session
                        accessor.setUser(() -> email);
                    } else {
                        // Token is mathematically structured correctly, but expired
                        throw AuthException.tokenExpired();
                    }
                } catch (Exception e) {
                    // Turn your domain exception into a concrete MessageDeliveryException
                    // so Spring STOMP can handle disconnecting the socket frame cleanly
                    throw new MessageDeliveryException("WebSocket Auth Failed: " + e.getMessage());
                }
            } else {
                throw new MessageDeliveryException("Missing authentication token");
            }
        } // Removed extra rogue closing bracket that was here

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // Try Header extraction first
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7); // Extract just the JWT
        }

        // Try Cookie extraction (from attributes mapped in HandshakeInterceptor)
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("accessToken")) {
            return (String) sessionAttributes.get("accessToken");
        }

        return null;
    }
}