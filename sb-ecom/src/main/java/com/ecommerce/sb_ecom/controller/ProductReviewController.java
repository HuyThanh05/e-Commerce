package com.ecommerce.sb_ecom.controller;

import com.ecommerce.sb_ecom.payload.ProductReviewDTO;
import com.ecommerce.sb_ecom.payload.ProductReviewRequest;
import com.ecommerce.sb_ecom.service.ProductReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductReviewController {
    private final ProductReviewService reviewService;

    public ProductReviewController(ProductReviewService reviewService) { this.reviewService = reviewService; }

    @GetMapping("/public/products/{productId}/reviews")
    public List<ProductReviewDTO> reviews(@PathVariable Long productId) {
        return reviewService.getReviews(productId);
    }

    @PostMapping("/reviews/products/{productId}")
    public ResponseEntity<ProductReviewDTO> review(@PathVariable Long productId,
                                                    @Valid @RequestBody ProductReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createOrUpdate(productId, request));
    }

    @GetMapping("/reviews/products/{productId}/eligibility")
    public Map<String, Boolean> eligibility(@PathVariable Long productId) {
        return Map.of("eligible", reviewService.canCurrentUserReview(productId));
    }
}
