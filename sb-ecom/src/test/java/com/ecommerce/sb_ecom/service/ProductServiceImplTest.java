package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.exceptions.APIException;
import com.ecommerce.sb_ecom.model.Category;
import com.ecommerce.sb_ecom.model.Product;
import com.ecommerce.sb_ecom.model.User;
import com.ecommerce.sb_ecom.payload.ProductDTO;
import com.ecommerce.sb_ecom.repositories.CartRepository;
import com.ecommerce.sb_ecom.repositories.CategoryRepository;
import com.ecommerce.sb_ecom.repositories.ProductRepository;
import com.ecommerce.sb_ecom.util.AuthUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {
    @Mock ProductRepository productRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock CartRepository cartRepository;
    @Mock CartService cartService;
    @Mock ModelMapper modelMapper;
    @Mock CloudinaryImageService cloudinaryImageService;
    @Mock AuthUtil authUtil;
    @InjectMocks ProductServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "imageBaseUrl", "http://localhost/images");
    }

    @Test
    void addProductCalculatesSpecialPriceAndAssignsSeller() {
        Category category = new Category(1L, "Phones", new ArrayList<>());
        User seller = new User();
        seller.setUserId(7L);
        ProductDTO request = new ProductDTO();
        request.setProductName("Phone");
        Product mapped = new Product();
        mapped.setProductName("Phone");
        mapped.setPrice(1000);
        mapped.setDiscount(10);
        ProductDTO response = new ProductDTO();
        response.setProductName("Phone");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(modelMapper.map(request, Product.class)).thenReturn(mapped);
        when(authUtil.loggedInUser()).thenReturn(seller);
        when(productRepository.save(mapped)).thenReturn(mapped);
        when(modelMapper.map(mapped, ProductDTO.class)).thenReturn(response);

        ProductDTO result = service.addProduct(1L, request);

        assertSame(response, result);
        assertEquals(900.0, mapped.getSpecialPrice());
        assertEquals("default.png", mapped.getImage());
        assertSame(category, mapped.getCategory());
        assertSame(seller, mapped.getUser());
        verify(productRepository).save(mapped);
    }

    @Test
    void addProductRejectsDuplicateNameInCategory() {
        Product existing = new Product();
        existing.setProductName("Phone");
        Category category = new Category(1L, "Phones", new ArrayList<>(java.util.List.of(existing)));
        ProductDTO request = new ProductDTO();
        request.setProductName("Phone");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        APIException error = assertThrows(APIException.class, () -> service.addProduct(1L, request));

        assertEquals("Product already exist!!", error.getMessage());
        verifyNoInteractions(productRepository);
    }

    @Test
    void deleteProductRejectsUserWhoIsNeitherAdminNorOwner() {
        User owner = new User(); owner.setUserId(10L);
        User current = new User(); current.setUserId(20L);
        Product product = new Product(); product.setProductId(3L); product.setUser(owner);
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(authUtil.loggedInUser()).thenReturn(current);

        assertThrows(APIException.class, () -> service.deleteProduct(3L));

        verify(productRepository, never()).delete(any(Product.class));
    }
}
