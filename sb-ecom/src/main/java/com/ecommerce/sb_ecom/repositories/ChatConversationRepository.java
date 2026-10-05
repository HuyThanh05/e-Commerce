package com.ecommerce.sb_ecom.repositories;

import com.ecommerce.sb_ecom.model.ChatConversation;
import com.ecommerce.sb_ecom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    Optional<ChatConversation> findByCustomerAndSeller(User customer, User seller);

    @Query("select c from ChatConversation c where c.customer = :user or c.seller = :user order by c.updatedAt desc")
    List<ChatConversation> findForUser(@Param("user") User user);
}
