package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.payload.ChatConversationDTO;
import com.ecommerce.sb_ecom.payload.ChatMessageDTO;
import com.ecommerce.sb_ecom.payload.SendChatMessageRequest;

import java.util.List;

public interface ChatService {
    ChatConversationDTO createConversation(Long productId);
    List<ChatConversationDTO> getConversations();
    List<ChatMessageDTO> getMessages(Long conversationId);
    void markRead(Long conversationId);
    long getUnreadCount();
    ChatMessageDTO sendMessage(String username, SendChatMessageRequest request);
    String getRecipientUsername(Long conversationId, String senderUsername);
}
