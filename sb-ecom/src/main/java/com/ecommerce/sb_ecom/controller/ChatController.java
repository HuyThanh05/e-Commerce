package com.ecommerce.sb_ecom.controller;

import com.ecommerce.sb_ecom.payload.ChatConversationDTO;
import com.ecommerce.sb_ecom.payload.ChatMessageDTO;
import com.ecommerce.sb_ecom.payload.CreateConversationRequest;
import com.ecommerce.sb_ecom.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/conversations")
    public ResponseEntity<ChatConversationDTO> createConversation(@Valid @RequestBody CreateConversationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.createConversation(request.getProductId()));
    }

    @GetMapping("/conversations")
    public List<ChatConversationDTO> conversations() {
        return chatService.getConversations();
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<ChatMessageDTO> messages(@PathVariable Long conversationId) {
        return chatService.getMessages(conversationId);
    }

    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long conversationId) {
        chatService.markRead(conversationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", chatService.getUnreadCount());
    }
}
