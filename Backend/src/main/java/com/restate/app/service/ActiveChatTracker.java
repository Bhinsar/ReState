package com.restate.app.service;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ActiveChatTracker {
    // Maps email -> conversationId
    private final Map<String, String> userConversations = new ConcurrentHashMap<>();
    // Maps sessionId_subscriptionId -> conversationId
    private final Map<String, String> subscriptionTracker = new ConcurrentHashMap<>();

    public void enterConversation(String email, String conversationId) {
        userConversations.put(email, conversationId);
    }

    public void leaveConversation(String email) {
        userConversations.remove(email);
    }

    public void trackSubscription(String sessionId, String subscriptionId, String conversationId) {
        subscriptionTracker.put(sessionId + "_" + subscriptionId, conversationId);
    }

    public String removeSubscription(String sessionId, String subscriptionId) {
        return subscriptionTracker.remove(sessionId + "_" + subscriptionId);
    }

    public void clearSession(String sessionId, String email) {
        userConversations.remove(email);
        subscriptionTracker.keySet().removeIf(key -> key.startsWith(sessionId + "_"));
    }

    public boolean isUserInConversation(String email, String conversationId) {
        String current = userConversations.get(email);
        return conversationId.equals(current);
    }
}
