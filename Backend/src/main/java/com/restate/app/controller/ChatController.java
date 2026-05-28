package com.restate.app.controller;

import com.google.firebase.messaging.FirebaseMessagingException;
import com.restate.app.dto.chat.ConversationResponse;
import com.restate.app.dto.chat.MessageResponse;
import com.restate.app.dto.chat.SendMessageRequest;
import com.restate.app.dto.chat.TypingRequest;
import com.restate.app.dto.chat.TypingResponse;
import com.restate.app.entity.User;
import com.restate.app.service.ChatService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload SendMessageRequest request,
            Principal principal) {

        chatService.sendMessage(
                request.conversationId(),
                request.content(),
                principal.getName()
        );
    }

    @MessageMapping("/chat.read")
    public void markRead(
            @Payload String conversationId,
            Principal principal) {

        chatService.markAsRead(
                conversationId,
                principal.getName()
        );
    }

    // Client is typing indicator
    @MessageMapping("/chat.typing")
    public void typing(
            @Payload TypingRequest request,
            @AuthenticationPrincipal User user) {

        User recipient = chatService.typing(user.getEmail(), request);

        // Send ONLY to recipient — not back to sender
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/typing",
                new TypingResponse(
                        user.getId(),
                        user.getFirstName(),
                        request.conversationId(),
                        request.isTyping()
                )
        );
    }

    // Get all conversations for the authenticated user (paginated with search)
    @GetMapping("/api/v1/chats/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(
            @RequestParam(value = "search", required = false) String search,
            Pageable pageable,
            @AuthenticationPrincipal User user) {

        Page<ConversationResponse> page = chatService.getConversations(user, search, pageable);
        return ApiResponse.pagedOk("Conversations fetched successfully", page, page.getContent());
    }

    // Get all messages for a specific conversation (paginated)
    @GetMapping("/api/v1/chats/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable("conversationId") String conversationId,
            Pageable pageable,
            @AuthenticationPrincipal User user) {

        Page<MessageResponse> page = chatService.getMessages(conversationId, user, pageable);
        return ApiResponse.pagedOk("Messages fetched successfully", page, page.getContent());
    }
}
