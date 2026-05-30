package com.restate.app.service;

import java.time.Instant;

import com.restate.app.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.messaging.FirebaseMessagingException;
import com.restate.app.dto.notification.NotificationResponse;
import com.restate.app.entity.Notification;
import com.restate.app.entity.Property;
import com.restate.app.entity.User;
import com.restate.app.exception.notification.NotificationException;
import com.restate.app.exception.property.PropertyException;
import com.restate.app.repository.NotificationRepo;
import com.restate.app.repository.PropertyRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepo notificationRepo;
    private final PropertyRepo propertyRepo;
    private final UserDeviceService userDeviceService;
    private final ChatService chatService;

    public void notifyPropertyInterset(String propertyId, User user ) throws FirebaseMessagingException {
        if (notificationRepo.existsByPropertyIdAndSenderIdAndType(propertyId, user.getId(), Notification.NotificationType.PROPERTY_INTEREST)) {
            throw PropertyException.alreadyExpressedInterest();
        }

        Property property = propertyRepo.findById(propertyId).orElseThrow(PropertyException::noPropertyFound);
        User owner = property.getOwner();
        Notification notification = Notification.builder()
                .recipient(owner)
                .sender(user)
                .type(Notification.NotificationType.PROPERTY_INTEREST)
                .title(user.getFirstName()
                        + " is interested in your property")
                .body(user.getFirstName()
                        + " " + user.getLastName()
                        + " showed interest in "
                        + property.getTitle()
                        + " in " + property.getAddress().getCity())
                .build();

        Conversation conversation = chatService.startPropertyInterestConversation(user, property);

                
        // Save to DB first — persists even if FCM fails
        notification.setConversation(conversation);
        Notification saved = notificationRepo.save(notification);

        // Send FCM — only fires if owner has devices registered
        userDeviceService.sendToUser(saved);

        // Initialize chat conversation and send interest message
    }

    // ── Get all notifications for a user ───────────────────────────
    public Page<NotificationResponse> getNotifications(
            User user, Pageable pageable) {

        return notificationRepo
                .findByRecipientOrderByCreatedAtDesc(user, pageable)
                .map(NotificationResponse::from);
    }

    // ── Get unread count ───────────────────────────────────────────
    public long getUnreadCount(User user) {

        return notificationRepo.countByRecipientAndIsReadFalse(user);
    }

    // ── Mark single notification as read ──────────────────────────
    @Transactional
    public void markAsRead(String notificationId, String email) {
        Notification notification = notificationRepo
                .findById(notificationId)
                .orElseThrow(NotificationException::noNotification);

        // Only recipient can mark as read
        if (!notification.getRecipient().getEmail().equals(email)) {
            throw NotificationException.notYourNotification();
        }

        notification.markAsRead();
        notificationRepo.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepo.markAllAsRead(user, Instant.now());
    }
}
