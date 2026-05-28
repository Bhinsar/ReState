package com.restate.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Builder
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "conversation")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String conversationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_one_id", nullable = false)
    private User userOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_two_id", nullable = false)
    private User userTwo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ConversationStatus status = ConversationStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at",
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant updatedAt;

    public enum ConversationStatus{
        ACTIVE, BLOCKED
    }
    // Helper — get other person from current user
    public User getOtherPerson(User me) {
        return userOne.getId().equals(me.getId())
                ? userTwo : userOne;
    }

    // Helper — check if user is participant
    public boolean isParticipant(User user) {
        return userOne.getId().equals(user.getId()) ||
                userTwo.getId().equals(user.getId());
    }
}
