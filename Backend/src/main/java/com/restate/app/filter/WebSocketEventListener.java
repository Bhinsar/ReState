package com.restate.app.filter;

import com.restate.app.repository.UserRepo;
import com.restate.app.service.ActiveChatTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepo userRepo;
    private final ActiveChatTracker activeChatTracker;

    // ── User connects ──────────────────────────────────────────────
    @EventListener
    public void handleConnect(SessionConnectedEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor
                .wrap(event.getMessage());

        if (accessor.getUser() == null) return;

        String email = accessor.getUser().getName();

        userRepo.findByEmail(email).ifPresent(user -> {

            // Mark online
            user.setOnline(true);
            userRepo.save(user);

            log.info("User online: {}", email);
        });
    }

    // ── User disconnects ───────────────────────────────────────────
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor
                .wrap(event.getMessage());

        if (accessor.getUser() == null) return;

        String email = accessor.getUser().getName();

        // Clear active chat tracker for this session
        activeChatTracker.clearSession(accessor.getSessionId(), email);

        userRepo.findByEmail(email).ifPresent(user -> {

            // Mark offline + update last seen
            user.setOnline(false);
            user.setLastSeen(Instant.now());
            userRepo.save(user);

            log.info("User offline: {}", email);
        });
    }

    // ── User subscribes to a topic ─────────────────────────────────
    @EventListener
    public void handleSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;

        String email = accessor.getUser().getName();
        String destination = accessor.getDestination();

        if (destination != null && destination.startsWith("/topic/conversation/")) {
            String conversationId = destination.substring("/topic/conversation/".length());
            // Ignore sub-destinations like "/read"
            if (!conversationId.contains("/")) {
                activeChatTracker.enterConversation(email, conversationId);
                activeChatTracker.trackSubscription(accessor.getSessionId(), accessor.getSubscriptionId(), conversationId);
                log.info("User {} entered conversation: {}", email, conversationId);
            }
        }
    }

    // ── User unsubscribes from a topic ──────────────────────────────
    @EventListener
    public void handleUnsubscribe(SessionUnsubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;

        String email = accessor.getUser().getName();
        String conversationId = activeChatTracker.removeSubscription(accessor.getSessionId(), accessor.getSubscriptionId());

        if (conversationId != null) {
            activeChatTracker.leaveConversation(email);
            log.info("User {} left conversation: {}", email, conversationId);
        }
    }
}
