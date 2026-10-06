package com.ecommerce.sb_ecom.repositories;

import com.ecommerce.sb_ecom.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {
    @Query("select coalesce(sum(oi.quantity), 0) from OrderItem oi where oi.product.productId = :productId " +
            "and lower(oi.order.orderStatus) not in ('cancelled', 'delivery failed')")
    Long sumSoldQuantity(@Param("productId") Long productId);

    @Query("select count(oi) > 0 from OrderItem oi where oi.product.productId = :productId " +
            "and lower(oi.order.email) = lower(:email) and lower(oi.order.orderStatus) = 'delivered'")
    boolean hasDeliveredPurchase(@Param("productId") Long productId, @Param("email") String email);
}
