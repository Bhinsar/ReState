package com.restate.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="user_devices")
@EntityListeners(AuditingEntityListener.class)
public class UserDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "device_id")
    private String deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "fcm_token", nullable = false, unique = true, columnDefinition = "TEXT")
    private String fcmToken;

    @Column(name = "device_name", columnDefinition = "TEXT")
    private String deviceName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlatformType platform;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreatedDate
    @Column(name="create_at", columnDefinition = "TIMESTAMP WITH TIME ZONE", nullable = false)
    private Instant createdAt =  Instant.now();

    @LastModifiedDate
    @Column(name = "last_used_at", columnDefinition = "TIMESTAMP WITH TIME ZONE", nullable = false)
    private Instant lastUsedAt;

    public enum PlatformType {
        ANDROID, IOS, WEB
    }

}
