package com.ecommerce.sb_ecom.controller;

import com.ecommerce.sb_ecom.payload.ChatMessageDTO;
import com.ecommerce.sb_ecom.payload.SendChatMessageRequest;
import com.ecommerce.sb_ecom.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void send(@Valid SendChatMessageRequest request, Principal principal) {
        if (principal == null) return;
        String recipient = chatService.getRecipientUsername(request.getConversationId(), principal.getName());
        ChatMessageDTO message = chatService.sendMessage(principal.getName(), request);
        messagingTemplate.convertAndSendToUser(recipient, "/queue/messages", message);
        messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/messages", message);
    }
}
