package com.ecommerce.sb_ecom.payload;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateConversationRequest {
    @NotNull
    private Long productId;
}
