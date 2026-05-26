package com.restate.app.repository;

import com.restate.app.entity.Notification;
import com.restate.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, String> {
    // All unread notifications for a user
    List<Notification> findByRecipientAndIsReadFalse(User recipient);

    // Unread count — for badge on bell icon
    long countByRecipientAndIsReadFalse(User recipient);

    // All notifications paginated
    Page<Notification> findByRecipientOrderByCreatedAtDesc(
            User recipient, Pageable pageable);

    // Mark all as read for a user
    @Modifying
    @Query("""
        UPDATE Notification n
        SET n.isRead = true, n.readAt = :now
        WHERE n.recipient = :recipient
        AND n.isRead = false
        """)
    void markAllAsRead(
            @Param("recipient") User recipient,
            @Param("now") Instant now);

    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.property.propertyId = :propertyId AND n.sender.id = :senderId AND n.type = :type")
    boolean existsByPropertyIdAndSenderIdAndType(
            @Param("propertyId") String propertyId,
            @Param("senderId") String senderId,
            @Param("type") Notification.NotificationType type);

}
