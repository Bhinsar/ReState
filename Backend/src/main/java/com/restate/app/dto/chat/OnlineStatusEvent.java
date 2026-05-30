package com.restate.app.dto.chat;

import java.time.Instant;

public record OnlineStatusEvent(
    String userId, 
    boolean isOnline, 
    Instant lastSeen) {}
