package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.exceptions.APIException;
import com.ecommerce.sb_ecom.model.Cart;
import com.ecommerce.sb_ecom.model.CartItem;
import com.ecommerce.sb_ecom.model.Product;
import com.ecommerce.sb_ecom.payload.CartDTO;
import com.ecommerce.sb_ecom.repositories.CartItemRepository;
import com.ecommerce.sb_ecom.repositories.CartRepository;
import com.ecommerce.sb_ecom.repositories.ProductRepository;
import com.ecommerce.sb_ecom.util.AuthUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {
    @Mock CartRepository cartRepository;
    @Mock AuthUtil authUtil;
    @Mock ProductRepository productRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock ModelMapper modelMapper;
    @InjectMocks CartServiceImpl service;

    @Test
    void addProductToExistingCartUpdatesTotalAndPersistsItem() {
        Cart cart = new Cart(4L, null, new ArrayList<>(), 20.0);
        Product product = new Product();
        product.setProductId(2L); product.setProductName("Phone"); product.setQuantity(5);
        product.setDiscount(10); product.setSpecialPrice(90);
        CartDTO mappedCart = new CartDTO();
        when(authUtil.loggedInEmail()).thenReturn("user@test.com");
        when(cartRepository.findCartByEmail("user@test.com")).thenReturn(cart);
        when(productRepository.findById(2L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findCartItemByProductIdAndCartId(4L, 2L)).thenReturn(null);
        when(modelMapper.map(cart, CartDTO.class)).thenReturn(mappedCart);

        CartDTO result = service.addProductToCart(2L, 2);

        assertSame(mappedCart, result);
        assertEquals(200.0, cart.getTotalPrice());
        ArgumentCaptor<CartItem> item = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(item.capture());
        assertEquals(2, item.getValue().getQuantity());
        assertEquals(90, item.getValue().getProductPrice());
        verify(cartRepository).save(cart);
    }

    @Test
    void addProductRejectsQuantityAboveStock() {
        Cart cart = new Cart(4L, null, new ArrayList<>(), 0.0);
        Product product = new Product(); product.setProductName("Phone"); product.setQuantity(1);
        when(authUtil.loggedInEmail()).thenReturn("user@test.com");
        when(cartRepository.findCartByEmail("user@test.com")).thenReturn(cart);
        when(productRepository.findById(2L)).thenReturn(Optional.of(product));

        assertThrows(APIException.class, () -> service.addProductToCart(2L, 2));

        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void deleteProductFromCartRecalculatesTotalAndDeletesItem() {
        Product product = new Product(); product.setProductName("Phone");
        Cart cart = new Cart(4L, null, new ArrayList<>(), 250.0);
        CartItem item = new CartItem(8L, cart, product, 2, 0, 100);
        when(cartRepository.findById(4L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findCartItemByProductIdAndCartId(4L, 2L)).thenReturn(item);

        String result = service.deleteProductFromCart(4L, 2L);

        assertEquals(50.0, cart.getTotalPrice());
        assertTrue(result.contains("Phone"));
        verify(cartItemRepository).deleteCartItemByProductIdAndCartId(4L, 2L);
    }

    @Test
    void getAllCartsRejectsEmptyRepository() {
        when(cartRepository.findAll()).thenReturn(List.of());
        assertThrows(APIException.class, service::getAllCarts);
    }
}
