package com.restate.app.controller;

import com.restate.app.dto.chat.SendMessageRequest;
import com.restate.app.dto.chat.TypingRequest;
import com.restate.app.dto.chat.TypingResponse;
import com.restate.app.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload SendMessageRequest request,
            Principal principal) {

        chatService.sendMessage(
                request,
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
            Principal principal) {

        String email = principal.getName();
        ChatService.TypingResult result = chatService.typing(email, request);

        log.info("Typing result: {}", result);

        // Send ONLY to recipient — not back to sender
        messagingTemplate.convertAndSendToUser(
                result.recipient().getEmail(),
                "/queue/typing",
                new TypingResponse(
                        result.sender().getId(),
                        result.sender().getFirstName(),
                        request.conversationId(),
                        request.isTyping()
                )
        );
    }
}
