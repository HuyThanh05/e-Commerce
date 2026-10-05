package com.ecommerce.sb_ecom.model;

import com.ecommerce.sb_ecom.exceptions.APIException;

import java.util.Locale;

public enum OrderStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    PREPARING("Preparing"),
    SHIPPING("Shipping"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled"),
    DELIVERY_FAILED("Delivery Failed");

    private final String value;

    OrderStatus(String value) { this.value = value; }

    public String value() { return value; }

    public static OrderStatus from(String raw) {
        if (raw == null) throw new APIException("Order status is required");
        String normalized = raw.trim().replace('-', '_').replace(' ', '_').toUpperCase(Locale.ROOT);
        if (normalized.equals("ACCEPTED") || normalized.equals("ORDER_ACCEPTED_!")) return CONFIRMED;
        if (normalized.equals("PROCESSING")) return PREPARING;
        if (normalized.equals("SHIPPED")) return SHIPPING;
        try {
            return valueOf(normalized);
        } catch (IllegalArgumentException exception) {
            throw new APIException("Unsupported order status: " + raw);
        }
    }
}
