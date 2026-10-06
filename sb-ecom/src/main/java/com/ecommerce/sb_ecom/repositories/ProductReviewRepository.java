package com.ecommerce.sb_ecom.repositories;

import com.ecommerce.sb_ecom.model.Product;
import com.ecommerce.sb_ecom.model.ProductReview;
import com.ecommerce.sb_ecom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductOrderByCreatedAtDesc(Product product);
    Optional<ProductReview> findByProductAndUser(Product product, User user);
    long countByProduct(Product product);

    @Query("select coalesce(avg(r.rating), 0) from ProductReview r where r.product = :product")
    Double averageRating(@Param("product") Product product);
}
