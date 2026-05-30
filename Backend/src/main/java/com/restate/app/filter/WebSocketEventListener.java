package com.restate.app.filter;

import com.restate.app.dto.chat.OnlineStatusEvent;
import com.restate.app.entity.User;
import com.restate.app.repository.ConversationRepo;
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
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepo userRepo;
    private final ConversationRepo conversationRepo;
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
            user.setIsOnline(true);
            userRepo.save(user);

            log.info("User online: {}", email);

            // Notify all conversation partners that this user is now online
            broadcastPresence(user, true, null);
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
            user.setIsOnline(false);
            user.setLastSeen(Instant.now());
            userRepo.save(user);

            log.info("User offline: {}", email);

            // Notify all conversation partners that this user is now offline
            broadcastPresence(user, false, user.getLastSeen());
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

    // ── Helper: fan-out presence event to all contacts ─────────────
    private void broadcastPresence(User user, boolean isOnline, Instant lastSeen) {
        try {
            List<User> partners = conversationRepo.findConversationPartnersOf(user.getId());
            OnlineStatusEvent event = new OnlineStatusEvent(user.getId(), isOnline, lastSeen);
            for (User partner : partners) {
                messagingTemplate.convertAndSendToUser(
                        partner.getEmail(),
                        "/queue/online-status",
                        event
                );
            }
            log.info("Broadcasted {} presence to {} contacts for user {}", isOnline ? "ONLINE" : "OFFLINE", partners.size(), user.getEmail());
        } catch (Exception e) {
            log.error("Failed to broadcast presence for user {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
