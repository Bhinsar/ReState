package com.restate.app.dto.notification;

import com.restate.app.entity.Notification;

import java.time.Instant;

public record NotificationResponse(
        String id,
        String title,
        String body,
        Notification.NotificationType type,
        String propertyId,
        String propertyTitle,
        boolean isRead,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getNotificationId(),
                n.getTitle(),
                n.getBody(),
                n.getType(),
                n.getProperty() != null
                        ? n.getProperty().getPropertyId() : null,
                n.getProperty() != null
                        ? n.getProperty().getTitle() : null,
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}
