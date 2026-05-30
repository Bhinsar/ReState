package com.restate.app.service;

import java.beans.Transient;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessagingException;
import com.restate.app.dto.chat.ConversationResponse;
import com.restate.app.dto.chat.ConversationSummaryDTO;
import com.restate.app.dto.chat.MessageResponse;
import com.restate.app.dto.chat.OtherUser;
import com.restate.app.dto.chat.SendMessageRequest;
import com.restate.app.dto.chat.TypingRequest;
import com.restate.app.dto.notification.NotificationResponse;
import com.restate.app.entity.Conversation;
import com.restate.app.entity.Message;
import com.restate.app.entity.Notification;
import com.restate.app.entity.Property;
import com.restate.app.entity.User;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.exception.chat.ChatException;
import com.restate.app.repository.ConversationRepo;
import com.restate.app.repository.MessageRepo;
import com.restate.app.repository.NotificationRepo;
import com.restate.app.repository.UserRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepo conversationRepo;
    private final UserRepo userRepo;
    private final MessageRepo messageRepo;
    private final NotificationRepo notificationRepo;
    private final UserDeviceService userDeviceService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ActiveChatTracker activeChatTracker;

    @Value("${project.frontendURL}")
    private String frontendURL;

    public void sendMessage(SendMessageRequest request, String email){
        Conversation conversation = conversationRepo.findByIdWithParticipants(request.conversationId())
                .orElseThrow(ChatException::conversationNotFoundWithId);

        User sender = userRepo.findByEmail(email)
                .orElseThrow(AuthException::noUserFound);

        if (!conversation.isParticipant(sender)) {
            throw ChatException.noParticipant();
        }

        if (conversation.getStatus() == Conversation.ConversationStatus.BLOCKED) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "Conversation is blocked");
        }

        // Save Message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.content())
                .attachmentUrl(request.attachmentUrl())
                .messageType(Message.MessageType.TEXT)
                .isRead(false)
                .sentAt(Instant.now())
                .build();
        message = messageRepo.save(message);

        // Update conversation's updatedAt timestamp
        conversation.setUpdatedAt(Instant.now());
        conversationRepo.save(conversation);

        // Map to response DTO
        MessageResponse response = MessageResponse.from(message);

        // Broadcast message to the conversation topic
        messagingTemplate.convertAndSend("/topic/conversation/" + request.conversationId(), response);

        // Create and save database notification for the recipient
        User recipient = conversation.getOtherPerson(sender);
        String notificationBody = (request.content() != null && !request.content().isBlank())
                ? request.content()
                : "Sent an attachment: " + request.attachmentUrl();
        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(Notification.NotificationType.NEW_MESSAGE)
                .title("New message from " + sender.getFirstName())
                .body(notificationBody)
                .isRead(false)
                .createdAt(Instant.now())
                .build();
//        notificationRepo.save(notification);

        // Send WebSocket notification to the recipient's private queue
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/notifications",
                NotificationResponse.from(notification)
        );

        // Send push notification via FCM only if recipient is not actively viewing this conversation.
        // activeChatTracker is the live, real-time source of truth — no stale DB flags needed.
        if (!activeChatTracker.isUserInConversation(recipient.getEmail(), request.conversationId())) {
            try {
                userDeviceService.sendToUser(notification);
            } catch (Exception e) {
                log.error("Failed to send FCM notification for message in chat: {}", e.getMessage());
            }
        } else {
            log.info("Skipping FCM for conversation {}; recipient is actively viewing it.", request.conversationId());
        }
    }
    @Transactional
    public void markAsRead(String conversationId, String email) {
        Conversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(ChatException::conversationNotFoundWithId);

        User user = userRepo.findByEmail(email)
                .orElseThrow(AuthException::noUserFound);

        if (!conversation.isParticipant(user)) {
            throw ChatException.noParticipant();
        }

        // Mark messages sent by the other person as read
        messageRepo.markAsRead(conversationId, user.getId());

        // Broadcast read receipt event to the conversation topic
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read", user.getId());
    }

    public record TypingResult(User sender, User recipient) {}

    public TypingResult typing(String email, TypingRequest request){
        // Use eager fetch query so userOne/userTwo are not lazy proxies —
        // avoids LazyInitializationException when accessing them outside a session
        Conversation conversation = conversationRepo.findByIdWithParticipants(request.conversationId())
                .orElseThrow(ChatException::conversationNotFoundWithId);

        // Security check — only participants can send typing
        User sender = userRepo.findByEmail(email)
                .orElseThrow(AuthException::noUserFound);

        if (!conversation.isParticipant(sender)) {
            throw ChatException.noParticipant();
        }

        // Get the OTHER person only
        User recipient = conversation.getOtherPerson(sender);
        return new TypingResult(sender, recipient);
    }

    public Conversation startPropertyInterestConversation(User sender, Property property) throws FirebaseMessagingException {
        User owner = property.getOwner();

        // Don't start conversation with yourself
        if (sender.getId().equals(owner.getId())) {
            ChatException.conversationYourSelf();
        }

        // Find existing conversation between the two users
        Conversation conversation = conversationRepo.findActiveConversationBetween(sender, owner)
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .userOne(sender)
                            .userTwo(owner)
                            .status(Conversation.ConversationStatus.ACTIVE)
                            .build();
                    return conversationRepo.save(newConv);
                });

        if (conversation.getStatus() == Conversation.ConversationStatus.BLOCKED) {
            ChatException.conversationIsBlocked(); // Don't send messages if blocked
        }

        // Format message content
        String content = String.format("Hi! I'm interested in your property *%s* in %s listed at ₹%s.",
                property.getTitle(),
                property.getAddress().getCity(),
                property.getPrice().toString());

        // Create and save Message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .messageType(Message.MessageType.LINK)
                .attachmentUrl(frontendURL + "/properties/" + property.getPropertyId())
                .isRead(false)
                .sentAt(Instant.now())
                .build();
        message = messageRepo.save(message);

        // Update conversation's updatedAt timestamp
        conversation.setUpdatedAt(Instant.now());
        Conversation saveConversation = conversationRepo.save(conversation);

        // Map to response DTO
        MessageResponse response = MessageResponse.from(message);

        // Broadcast message to the conversation topic
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getConversationId(), response);

        // Create and save database notification for the recipient
        Notification notification = Notification.builder()
                .recipient(owner)
                .sender(sender)
                .type(Notification.NotificationType.NEW_MESSAGE)
                .title("New message from " + sender.getFirstName())
                .body(content)
                .isRead(false)
                .createdAt(Instant.now())
                .build();
        notificationRepo.save(notification);

        // Send WebSocket notification to the recipient's private queue
        messagingTemplate.convertAndSendToUser(
                owner.getEmail(),
                "/queue/notifications",
                NotificationResponse.from(notification)
        );

        // Send push notification via FCM only if recipient is offline or not actively viewing this conversation
        if (!owner.getIsOnline() || !activeChatTracker.isUserInConversation(owner.getEmail(), conversation.getConversationId())) {
            try {
                userDeviceService.sendToUser(notification);
            } catch (Exception e) {
                log.error("Failed to send FCM notification for message in property interest chat: {}", e.getMessage());
            }
        }
        return saveConversation;
    }

    public Page<ConversationResponse> getConversations(User user, String search, Pageable pageable) {
        Page<ConversationSummaryDTO> summaries = conversationRepo.findConversationSummariesForUser(user, search, pageable).orElseThrow(ChatException::conversationNotFound);

        // Spring Data Page.map() never returns null; it returns an empty Page if no results match.
        return summaries.map(dto -> {
            User otherParticipant = dto.conversation().getOtherPerson(user);
            OtherUser otherResponse = OtherUser.from(otherParticipant);

            return new ConversationResponse(
                    dto.conversation().getConversationId(),
                    otherResponse,
                    dto.unreadCount(),
                    dto.lastMessageContent(),
                    dto.lastMessageTime(),
                    dto.conversation().getStatus()
            );
        });
    }

    public Page<MessageResponse> getMessages(String conversationId, User user, Pageable pageable) {
        Conversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(ChatException::conversationNotFoundWithId);

        // Security check: only participants can view messages
        if (!conversation.isParticipant(user)) {
            throw ChatException.noParticipant();
        }

        Page<Message> messages = messageRepo.findByConversationConversationIdOrderBySentAtDesc(
                conversationId, pageable
        );

        return messages.map(MessageResponse::from);
    }
}
