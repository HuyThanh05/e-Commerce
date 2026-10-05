package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.exceptions.APIException;
import com.ecommerce.sb_ecom.exceptions.ResourceNotFoundException;
import com.ecommerce.sb_ecom.model.*;
import com.ecommerce.sb_ecom.payload.OrderDTO;
import com.ecommerce.sb_ecom.payload.OrderItemDTO;
import com.ecommerce.sb_ecom.payload.OrderResponse;
import com.ecommerce.sb_ecom.repositories.*;
import com.ecommerce.sb_ecom.util.AuthUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    CartRepository cartRepository;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    CartService cartService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    AuthUtil authUtil;

    @Override
    @Transactional
    public OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage) {
        // Getting User Cart
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }
        Address address = addressRepository.findByAddressIdAndUserEmail(addressId, emailId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        List<CartItem> cartItems = new ArrayList<>(cart.getCartItems());
        if (cartItems.isEmpty()) {
            throw new APIException("Cart is empty");
        }
        cartItems.forEach(item -> {
            int requestedQuantity = item.getQuantity();
            Product product = item.getProduct();
            if (requestedQuantity <= 0 || product.getQuantity() < requestedQuantity) {
                throw new APIException("Insufficient stock for product: " + product.getProductName());
            }
        });

        if ("stripe".equalsIgnoreCase(pgName)) {
            verifyStripePayment(pgPaymentId, cart.getTotalPrice());
            pgStatus = "succeeded";
            pgResponseMessage = "Payment verified by Stripe";
        }

        // Create a new order with payment info
        Order order = new Order();
        order.setEmail(emailId);
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(cart.getTotalPrice());
        order.setOrderStatus(OrderStatus.PENDING.value());
        order.setStatusUpdatedAt(LocalDateTime.now());
        order.setAddress(address);

        Payment payment = new Payment(paymentMethod, pgPaymentId, pgStatus, pgResponseMessage, pgName);
        payment.setOrder(order);
        payment = paymentRepository.save(payment);
        order.setPayment(payment);
        Order savedOrder = orderRepository.save(order);

        // Get items from the cart into the order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }
        orderItems = orderItemRepository.saveAll(orderItems);

        // Update product stock
        cartItems.forEach(item -> {
            int quantity = item.getQuantity();
            Product product = item.getProduct();
            // Reduce stock quantity
            product.setQuantity(product.getQuantity() - quantity);
            // Save product back to the database
            productRepository.save(product);
            // Remove items from cart
            cartService.deleteProductFromCart(cart.getCartId(), item.getProduct().getProductId());
        });

        // Send back the order summary
        OrderDTO orderDTO = toOrderDTO(savedOrder);
        orderItems.forEach(item -> orderDTO.getOrderItems().add(modelMapper.map(item, OrderItemDTO.class)));
        orderDTO.setAddressId(addressId);
        return orderDTO;
    }

    private void verifyStripePayment(String paymentIntentId, Double expectedTotal) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new APIException("Stripe payment intent is required");
        }
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            long expectedAmount = BigDecimal.valueOf(expectedTotal)
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValueExact();
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new APIException("Stripe payment has not succeeded");
            }
            if (!Long.valueOf(expectedAmount).equals(paymentIntent.getAmountReceived())) {
                throw new APIException("Stripe payment amount does not match the order total");
            }
            if (!"vnd".equalsIgnoreCase(paymentIntent.getCurrency())) {
                throw new APIException("Unsupported Stripe payment currency");
            }
        } catch (StripeException exception) {
            throw new APIException("Unable to verify Stripe payment");
        }
    }

    @Override
    public OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Order> pageOrders = orderRepository.findAll(pageDetails);
        List<Order> orders = pageOrders.getContent();
        List<OrderDTO> orderDTOs = orders.stream().map(this::toOrderDTO).toList();
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setContent(orderDTOs);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());
        return orderResponse;
    }

    @Override
    public OrderDTO updateOrder(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        order.setOrderStatus(status);
        applyStatusTimestamp(order, OrderStatus.from(status));
        orderRepository.save(order);
        return toOrderDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO updateSellerOrder(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        User seller = authUtil.loggedInUser();
        assertSellerOwnsOrder(order, seller);

        OrderStatus current = OrderStatus.from(order.getOrderStatus());
        OrderStatus next = OrderStatus.from(status);
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED;
            case CONFIRMED -> next == OrderStatus.PREPARING;
            case PREPARING -> next == OrderStatus.SHIPPING;
            case SHIPPING -> next == OrderStatus.DELIVERED || next == OrderStatus.DELIVERY_FAILED;
            default -> false;
        };
        if (!valid) {
            throw new APIException("Cannot change order status from " + current.value() + " to " + next.value());
        }
        order.setOrderStatus(next.value());
        applyStatusTimestamp(order, next);
        return toOrderDTO(orderRepository.save(order));
    }

    @Override
    public List<OrderDTO> getCurrentUserOrders() {
        return orderRepository.findByEmailOrderByOrderDateDescOrderIdDesc(authUtil.loggedInEmail())
                .stream().map(this::toOrderDTO).toList();
    }

    @Override
    public OrderDTO getCurrentUserOrder(Long orderId) {
        Order order = getOwnedCustomerOrder(orderId);
        return toOrderDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO cancelCurrentUserOrder(Long orderId) {
        Order order = getOwnedCustomerOrder(orderId);
        OrderStatus current = OrderStatus.from(order.getOrderStatus());
        if (current != OrderStatus.PENDING) {
            throw new APIException("Only pending orders can be cancelled");
        }
        order.setOrderStatus(OrderStatus.CANCELLED.value());
        applyStatusTimestamp(order, OrderStatus.CANCELLED);
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
        if (order.getPayment() != null && "stripe".equalsIgnoreCase(order.getPayment().getPgName())) {
            order.getPayment().setPgStatus("refund_pending");
        }
        return toOrderDTO(orderRepository.save(order));
    }

//    @Override
//    public OrderResponse getAllSellerOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
//        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
//                ? Sort.by(sortBy).ascending()
//                : Sort.by(sortBy).descending();
//        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
//        User seller = authUtil.loggedInUser();
//        Page<Order> pageOrders = orderRepository.findAll(pageDetails);
//        List<Order> sellerOrders = pageOrders.getContent().stream().filter(order -> order.getOrderItems().stream().anyMatch(
//                orderItem -> {
//                    var product = orderItem.getProduct();
//                    if (product == null || product.getUser() == null) {
//                        return false;
//                    }
//                    return product.getUser().getUserId().equals(
//                            seller.getUserId());
//                })).toList();
//        List<OrderDTO> orderDTOs = sellerOrders.stream().map(order -> modelMapper.map(order, OrderDTO.class)).toList();
//        OrderResponse orderResponse = new OrderResponse();
//        orderResponse.setContent(orderDTOs);
//        orderResponse.setPageNumber(pageOrders.getNumber());
//        orderResponse.setPageSize(pageOrders.getSize());
//        orderResponse.setTotalElements(pageOrders.getTotalElements());
//        orderResponse.setTotalPages(pageOrders.getTotalPages());
//        orderResponse.setLastPage(pageOrders.isLast());
//        return orderResponse;
//    }

    @Override
    public OrderResponse getAllSellerOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        User seller = authUtil.loggedInUser();

        // Filter FIRST across ALL orders (not just the current page), THEN paginate the filtered result.
        List<Order> allOrdersSorted = orderRepository.findAll(sortByAndOrder);
        List<Order> sellerOrders = allOrdersSorted.stream().filter(order -> order.getOrderItems().stream().anyMatch(
                orderItem -> {
                    var product = orderItem.getProduct();
                    if (product == null || product.getUser() == null) {
                        return false;
                    }
                    return product.getUser().getUserId().equals(
                            seller.getUserId());
                })).toList();

        int totalElements = sellerOrders.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        int fromIndex = Math.min(pageNumber * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        List<Order> pagedSellerOrders = sellerOrders.subList(fromIndex, toIndex);

        List<OrderDTO> orderDTOs = pagedSellerOrders.stream().map(order -> toSellerOrderDTO(order, seller)).toList();
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setContent(orderDTOs);
        orderResponse.setPageNumber(pageNumber);
        orderResponse.setPageSize(pageSize);
        orderResponse.setTotalElements((long) totalElements);
        orderResponse.setTotalPages(totalPages);
        orderResponse.setLastPage(pageNumber >= totalPages - 1);
        return orderResponse;
    }

    private Order getOwnedCustomerOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        if (!order.getEmail().equalsIgnoreCase(authUtil.loggedInEmail())) {
            throw new APIException("You are not allowed to access this order");
        }
        return order;
    }

    private void assertSellerOwnsOrder(Order order, User seller) {
        boolean ownsItem = order.getOrderItems().stream().anyMatch(item -> item.getProduct() != null
                && item.getProduct().getUser() != null
                && item.getProduct().getUser().getUserId().equals(seller.getUserId()));
        if (!ownsItem) throw new APIException("You are not allowed to update this order");
    }

    private void applyStatusTimestamp(Order order, OrderStatus status) {
        LocalDateTime now = LocalDateTime.now();
        order.setStatusUpdatedAt(now);
        switch (status) {
            case CONFIRMED -> order.setConfirmedAt(now);
            case PREPARING -> order.setPreparingAt(now);
            case SHIPPING, DELIVERY_FAILED -> order.setShippedAt(order.getShippedAt() == null ? now : order.getShippedAt());
            case DELIVERED -> order.setDeliveredAt(now);
            case CANCELLED -> order.setCancelledAt(now);
            default -> { }
        }
    }

    private OrderDTO toOrderDTO(Order order) {
        OrderDTO dto = modelMapper.map(order, OrderDTO.class);
        if (dto.getOrderItems() == null) dto.setOrderItems(new ArrayList<>());
        if (order.getAddress() != null) {
            dto.setAddressId(order.getAddress().getAddressId());
            dto.setAddress(modelMapper.map(order.getAddress(), com.ecommerce.sb_ecom.payload.AddressDTO.class));
        }
        return dto;
    }

    private OrderDTO toSellerOrderDTO(Order order, User seller) {
        OrderDTO dto = toOrderDTO(order);
        List<OrderItemDTO> sellerItems = order.getOrderItems().stream()
                .filter(item -> item.getProduct() != null && item.getProduct().getUser() != null
                        && item.getProduct().getUser().getUserId().equals(seller.getUserId()))
                .map(item -> modelMapper.map(item, OrderItemDTO.class)).toList();
        dto.setOrderItems(new ArrayList<>(sellerItems));
        dto.setTotalAmount(sellerItems.stream()
                .mapToDouble(item -> item.getOrderedProductPrice() * item.getQuantity()).sum());
        return dto;
    }
}
