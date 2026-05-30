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
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)  // ← fixed
    @Column(name = "conversation_id",
            updatable = false,
            nullable = false)
    private String conversationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_one_id", nullable = false,
            foreignKey = @ForeignKey(
                    foreignKeyDefinition = "FOREIGN KEY (user_one_id) " +
                            "REFERENCES users(id) ON DELETE CASCADE"
            ))
    private User userOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_two_id", nullable = false,
            foreignKey = @ForeignKey(
                    foreignKeyDefinition = "FOREIGN KEY (user_two_id) " +
                            "REFERENCES users(id) ON DELETE CASCADE"
            ))
    private User userTwo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
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

    public enum ConversationStatus {
        ACTIVE, BLOCKED
    }

    public User getOtherPerson(User me) {
        return userOne.getId().equals(me.getId())
                ? userTwo : userOne;
    }

    public boolean isParticipant(User user) {
        return userOne.getId().equals(user.getId()) ||
                userTwo.getId().equals(user.getId());
    }
}