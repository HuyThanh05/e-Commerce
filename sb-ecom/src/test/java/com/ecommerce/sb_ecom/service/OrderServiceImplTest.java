package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.exceptions.APIException;
import com.ecommerce.sb_ecom.model.*;
import com.ecommerce.sb_ecom.payload.OrderDTO;
import com.ecommerce.sb_ecom.repositories.*;
import com.ecommerce.sb_ecom.util.AuthUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {
    @Mock CartRepository cartRepository;
    @Mock AddressRepository addressRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock OrderRepository orderRepository;
    @Mock PaymentRepository paymentRepository;
    @Mock CartService cartService;
    @Mock ModelMapper modelMapper;
    @Mock ProductRepository productRepository;
    @Mock AuthUtil authUtil;
    @InjectMocks OrderServiceImpl service;

    @Test
    void placeOrderCreatesItemsReducesStockAndClearsCart() {
        Product product = new Product();
        product.setProductId(5L); product.setProductName("Phone"); product.setQuantity(10);
        Cart cart = new Cart(3L, null, new ArrayList<>(), 180.0);
        CartItem cartItem = new CartItem(7L, cart, product, 2, 10, 90);
        cart.getCartItems().add(cartItem);
        Address address = new Address(); address.setAddressId(9L);
        OrderDTO dto = new OrderDTO(); dto.setOrderItems(new ArrayList<>());

        when(cartRepository.findCartByEmail("user@test.com")).thenReturn(cart);
        when(addressRepository.findByAddressIdAndUserEmail(9L, "user@test.com")).thenReturn(Optional.of(address));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(orderItemRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));
        when(modelMapper.map(any(Order.class), eq(OrderDTO.class))).thenReturn(dto);

        OrderDTO result = service.placeOrder("user@test.com", 9L, "cash", "cod", null, "pending", "created");

        assertSame(dto, result);
        assertEquals(8, product.getQuantity());
        assertEquals(9L, result.getAddressId());
        assertEquals(1, result.getOrderItems().size());
        verify(productRepository).save(product);
        verify(cartService).deleteProductFromCart(3L, 5L);
    }

    @Test
    void placeOrderRejectsInsufficientStock() {
        Product product = new Product(); product.setProductName("Phone"); product.setQuantity(1);
        Cart cart = new Cart(3L, null, new ArrayList<>(), 180.0);
        cart.getCartItems().add(new CartItem(7L, cart, product, 2, 0, 90));
        Address address = new Address(); address.setAddressId(9L);
        when(cartRepository.findCartByEmail("user@test.com")).thenReturn(cart);
        when(addressRepository.findByAddressIdAndUserEmail(9L, "user@test.com")).thenReturn(Optional.of(address));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(orderItemRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));

        assertThrows(APIException.class,
                () -> service.placeOrder("user@test.com", 9L, "cash", "cod", null, "pending", "created"));

        verify(productRepository, never()).save(any());
        verify(cartService, never()).deleteProductFromCart(anyLong(), anyLong());
    }

    @Test
    void updateOrderChangesStatus() {
        Order order = new Order(); order.setOrderId(11L); order.setOrderStatus("Accepted");
        OrderDTO dto = new OrderDTO(); dto.setOrderStatus("Shipped");
        when(orderRepository.findById(11L)).thenReturn(Optional.of(order));
        when(modelMapper.map(order, OrderDTO.class)).thenReturn(dto);

        OrderDTO result = service.updateOrder(11L, "Shipped");

        assertEquals("Shipped", order.getOrderStatus());
        assertSame(dto, result);
        verify(orderRepository).save(order);
    }
}
