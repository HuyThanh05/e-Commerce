package com.ecommerce.sb_ecom.controller;

import com.ecommerce.sb_ecom.payload.AuthenticationResult;
import com.ecommerce.sb_ecom.payload.CartDTO;
import com.ecommerce.sb_ecom.payload.OrderDTO;
import com.ecommerce.sb_ecom.payload.OrderItemDTO;
import com.ecommerce.sb_ecom.repositories.CartRepository;
import com.ecommerce.sb_ecom.security.jwt.JwtUtils;
import com.ecommerce.sb_ecom.security.response.MessageResponse;
import com.ecommerce.sb_ecom.security.response.UserInfoResponse;
import com.ecommerce.sb_ecom.security.services.UserDetailsServiceImpl;
import com.ecommerce.sb_ecom.service.AuthService;
import com.ecommerce.sb_ecom.service.AddressService;
import com.ecommerce.sb_ecom.service.CartService;
import com.ecommerce.sb_ecom.service.OrderService;
import com.ecommerce.sb_ecom.service.StripeService;
import com.ecommerce.sb_ecom.util.AuthUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = {AuthController.class, AddressController.class, CartController.class, OrderController.class},
        excludeAutoConfiguration = {OAuth2ClientAutoConfiguration.class, OAuth2ClientWebSecurityAutoConfiguration.class}
)
@AutoConfigureMockMvc(addFilters = false)
class CoreApiIntegrationTest {
    @Autowired MockMvc mockMvc;

    @MockitoBean AuthService authService;
    @MockitoBean AddressService addressService;
    @MockitoBean CartService cartService;
    @MockitoBean OrderService orderService;
    @MockitoBean StripeService stripeService;
    @MockitoBean CartRepository cartRepository;
    @MockitoBean AuthUtil authUtil;
    @MockitoBean JwtUtils jwtUtils;
    @MockitoBean UserDetailsServiceImpl userDetailsService;

    @Test
    void createAddressReturnsFieldValidationInsteadOfInternalServerError() throws Exception {
        mockMvc.perform(post("/api/addresses")
                        .contentType("application/json")
                        .content("""
                                {
                                  "buildingName": "A",
                                  "city": "HCM",
                                  "state": "HCM",
                                  "pincode": "1",
                                  "street": "X",
                                  "country": "VN"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.buildingName").exists())
                .andExpect(jsonPath("$.pincode").exists())
                .andExpect(jsonPath("$.street").exists());
    }

    @Test
    void signupAcceptsValidRequestAndReturnsSuccessMessage() throws Exception {
        when(authService.register(any())).thenReturn(
                ResponseEntity.ok(new MessageResponse("User registered successfully!")));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType("application/json")
                        .content("""
                                {"username":"alice","email":"alice@example.com","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        verify(authService).register(any());
    }

    @Test
    void signinReturnsUserAndJwtCookie() throws Exception {
        ResponseCookie cookie = ResponseCookie.from("springBootEcom", "jwt-token")
                .httpOnly(true).path("/").build();
        UserInfoResponse response = new UserInfoResponse(
                1L, "alice", List.of("ROLE_USER"), "alice@example.com", cookie.toString());
        when(authService.login(any())).thenReturn(new AuthenticationResult(response, cookie));

        mockMvc.perform(post("/api/auth/signin")
                        .contentType("application/json")
                        .content("""
                                {"username":"alice","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("springBootEcom=jwt-token")))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_USER"));

        verify(authService).login(any());
    }

    @Test
    void addProductToCartReturnsCreatedCart() throws Exception {
        CartDTO cart = new CartDTO(3L, 180.0, new ArrayList<>());
        when(cartService.addProductToCart(5L, 2)).thenReturn(cart);

        mockMvc.perform(post("/api/carts/products/5/quantity/2"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cartId").value(3))
                .andExpect(jsonPath("$.totalPrice").value(180.0))
                .andExpect(jsonPath("$.products").isArray());

        verify(cartService).addProductToCart(5L, 2);
    }

    @Test
    void createOrderUsesAuthenticatedEmailAndReturnsCreatedOrder() throws Exception {
        OrderDTO order = new OrderDTO();
        order.setOrderId(12L);
        order.setEmail("alice@example.com");
        order.setAddressId(9L);
        order.setOrderStatus("Accepted");
        order.setOrderItems(new ArrayList<OrderItemDTO>());
        when(authUtil.loggedInEmail()).thenReturn("alice@example.com");
        when(orderService.placeOrder("alice@example.com", 9L, "cash", "cod", null,
                "pending", "created")).thenReturn(order);

        mockMvc.perform(post("/api/order/users/payments/cash")
                        .contentType("application/json")
                        .content("""
                                {
                                  "addressId": 9,
                                  "pgName": "cod",
                                  "pgStatus": "pending",
                                  "pgResponseMessage": "created"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(12))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.orderStatus").value("Accepted"));

        verify(orderService).placeOrder("alice@example.com", 9L, "cash", "cod", null,
                "pending", "created");
    }
}
