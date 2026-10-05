package com.ecommerce.sb_ecom.repositories;

import com.ecommerce.sb_ecom.model.ChatConversation;
import com.ecommerce.sb_ecom.model.ChatMessage;
import com.ecommerce.sb_ecom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationOrderBySentAtAsc(ChatConversation conversation);
    Optional<ChatMessage> findFirstByConversationOrderBySentAtDesc(ChatConversation conversation);
    long countByConversationAndSenderNotAndReadAtIsNull(ChatConversation conversation, User sender);

    @Query("select count(m) from ChatMessage m where m.sender <> :user and m.readAt is null and " +
            "(m.conversation.customer = :user or m.conversation.seller = :user)")
    long countUnreadForUser(@Param("user") User user);

    @Modifying
    @Query("update ChatMessage m set m.readAt = :readAt where m.conversation = :conversation " +
            "and m.sender <> :user and m.readAt is null")
    int markRead(@Param("conversation") ChatConversation conversation, @Param("user") User user,
                 @Param("readAt") LocalDateTime readAt);
}
