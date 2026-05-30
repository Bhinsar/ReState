package com.restate.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    private NotificationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(nullable = false, name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant readAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", nullable = false)
    private Instant createdAt;

    public void markAsRead() {
        this.isRead = true;
        this.readAt = Instant.now();
    }

    public enum NotificationType {
        PROPERTY_INTEREST,
        NEW_MESSAGE,
        TRADE_REQUEST,
        TRADE_ACCEPTED,
        TRADE_REJECTED,
        PROPERTY_APPROVED,
        SYSTEM
    }
}
