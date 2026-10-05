package com.ecommerce.sb_ecom.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationDTO {
    private Long conversationId;
    private Long customerId;
    private String customerName;
    private Long sellerId;
    private String sellerName;
    private Long otherUserId;
    private String otherUserName;
    private Long productId;
    private String productName;
    private String productImage;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}
