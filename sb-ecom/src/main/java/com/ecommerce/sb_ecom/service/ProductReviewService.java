package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.exceptions.APIException;
import com.ecommerce.sb_ecom.exceptions.ResourceNotFoundException;
import com.ecommerce.sb_ecom.model.Product;
import com.ecommerce.sb_ecom.model.ProductReview;
import com.ecommerce.sb_ecom.model.User;
import com.ecommerce.sb_ecom.payload.ProductReviewDTO;
import com.ecommerce.sb_ecom.payload.ProductReviewRequest;
import com.ecommerce.sb_ecom.repositories.OrderItemRepository;
import com.ecommerce.sb_ecom.repositories.ProductRepository;
import com.ecommerce.sb_ecom.repositories.ProductReviewRepository;
import com.ecommerce.sb_ecom.util.AuthUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductReviewService {
    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final AuthUtil authUtil;

    public ProductReviewService(ProductReviewRepository reviewRepository, ProductRepository productRepository,
                                OrderItemRepository orderItemRepository, AuthUtil authUtil) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.authUtil = authUtil;
    }

    @Transactional(readOnly = true)
    public List<ProductReviewDTO> getReviews(Long productId) {
        Product product = getProduct(productId);
        return reviewRepository.findByProductOrderByCreatedAtDesc(product).stream().map(this::toDTO).toList();
    }

    @Transactional
    public ProductReviewDTO createOrUpdate(Long productId, ProductReviewRequest request) {
        Product product = getProduct(productId);
        User user = authUtil.loggedInUser();
        if (!orderItemRepository.hasDeliveredPurchase(productId, user.getEmail())) {
            throw new APIException("You can only review a product after it has been delivered");
        }
        ProductReview review = reviewRepository.findByProductAndUser(product, user).orElseGet(() -> {
            ProductReview created = new ProductReview();
            created.setProduct(product);
            created.setUser(user);
            return created;
        });
        review.setRating(request.getRating());
        review.setComment(request.getComment() == null ? "" : request.getComment().trim());
        return toDTO(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public boolean canCurrentUserReview(Long productId) {
        getProduct(productId);
        return orderItemRepository.hasDeliveredPurchase(productId, authUtil.loggedInEmail());
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
    }

    private ProductReviewDTO toDTO(ProductReview review) {
        return new ProductReviewDTO(review.getReviewId(), review.getProduct().getProductId(),
                review.getUser().getUserId(), review.getUser().getUserName(), review.getRating(),
                review.getComment(), review.getCreatedAt());
    }
}
