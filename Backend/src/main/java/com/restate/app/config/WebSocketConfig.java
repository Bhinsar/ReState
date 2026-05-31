package com.restate.app.config;

import com.restate.app.filter.WebSocketAuthInterceptor;
import com.restate.app.filter.WebSocketHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final WebSocketAuthInterceptor authInterceptor;
    private final WebSocketHandshakeInterceptor handshakeInterceptor;
    @Value("${project.frontendURL}")
    private String frontendURL;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // Prefix for messages FROM server TO client
        // /topic  → broadcast (one to many) — chat messages
        // /queue  → private  (one to one)   — notifications
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix for messages FROM client TO server
        // Client sends to /app/chat.send
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix for private user messages
        // /user/queue/notifications → only goes to that specific user
        registry.setUserDestinationPrefix("/user");
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws", "/api/v1/ws")
                .setAllowedOriginPatterns(frontendURL)
                .addInterceptors(handshakeInterceptor)
                .withSockJS();
    }



    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration) {
        // Every incoming WebSocket message passes through this
        registration.interceptors(authInterceptor);
    }
}
