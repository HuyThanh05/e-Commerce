package com.ecommerce.sb_ecom.config;

import com.ecommerce.sb_ecom.model.Category;
import com.ecommerce.sb_ecom.model.AppRole;
import com.ecommerce.sb_ecom.model.Product;
import com.ecommerce.sb_ecom.model.Role;
import com.ecommerce.sb_ecom.model.User;
import com.ecommerce.sb_ecom.repositories.CategoryRepository;
import com.ecommerce.sb_ecom.repositories.ProductRepository;
import com.ecommerce.sb_ecom.repositories.RoleRepository;
import com.ecommerce.sb_ecom.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;

@Configuration
@Profile("local")
public class LocalSampleDataConfig {

    @Bean
    CommandLineRunner seedLocalProducts(CategoryRepository categoryRepository,
                                        ProductRepository productRepository,
                                        UserRepository userRepository,
                                        RoleRepository roleRepository,
                                        PasswordEncoder passwordEncoder) {
        return args -> {
            Role sellerRole = roleRepository.findByRoleName(AppRole.ROLE_SELLER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_SELLER)));
            User seller = userRepository.findByUserName("seller").orElseGet(() -> {
                User localSeller = new User(
                        "seller",
                        "seller@amazingshop.local",
                        passwordEncoder.encode("Seller@123"));
                localSeller.setRoles(new HashSet<>(List.of(sellerRole)));
                return userRepository.save(localSeller);
            });
            if (seller.getRoles().stream().noneMatch(role -> role.getRoleName() == AppRole.ROLE_SELLER)) {
                seller.getRoles().add(sellerRole);
                userRepository.save(seller);
            }

            if (productRepository.count() > 0) {
                productRepository.findAll().forEach(product -> {
                    if (product.getUser() == null) {
                        product.setUser(seller);
                    }
                    String realImage = realImageFor(product.getProductName());
                    if (realImage != null) {
                        product.setImage("http://localhost:5000/sample-products/" + realImage);
                    }
                });
                productRepository.flush();
                return;
            }

            Category electronics = category(categoryRepository, "Điện tử");
            Category phones = category(categoryRepository, "Điện thoại");
            Category fashion = category(categoryRepository, "Thời trang");
            Category home = category(categoryRepository, "Nhà cửa");
            Category accessories = category(categoryRepository, "Phụ kiện");

            productRepository.saveAll(List.of(
                    product("Tai nghe Bluetooth chống ồn H1", "Âm thanh rõ nét, pin 30 giờ và chống ồn chủ động.", 40, 699_000, 43, electronics, seller, "headphones-real.jpg"),
                    product("Điện thoại Nova X5 128GB", "Màn hình AMOLED 120Hz, camera 50MP và sạc nhanh.", 24, 8_990_000, 12, phones, seller, "phone-real.jpg"),
                    product("Đồng hồ thông minh S9", "Theo dõi sức khỏe, luyện tập và nhận thông báo tức thì.", 35, 990_000, 34, accessories, seller, "watch-real.jpg"),
                    product("Giày sneaker basic unisex", "Thiết kế tối giản, đế êm và dễ phối đồ hàng ngày.", 50, 520_000, 44, fashion, seller, "sneaker-real.jpg"),
                    product("Đèn bàn LED chống cận", "Ba mức sáng, điều chỉnh nhiệt màu và tiết kiệm điện.", 28, 459_000, 22, home, seller, "lamp-real.jpg"),
                    product("Bàn phím cơ không dây K68", "Kết nối đa thiết bị, switch êm và pin dung lượng cao.", 20, 1_290_000, 20, electronics, seller, "keyboard-real.jpg"),
                    product("Loa Bluetooth Mini Pro", "Âm thanh mạnh mẽ, chống nước và nghe nhạc đến 12 giờ.", 32, 749_000, 27, electronics, seller, "speaker-real.jpg"),
                    product("Balo laptop chống nước 15.6 inch", "Nhiều ngăn tiện dụng, chất liệu bền và chống thấm.", 45, 489_000, 18, fashion, seller, "backpack-real.jpg")
            ));
        };
    }

    private Category category(CategoryRepository repository, String name) {
        Category existing = repository.findByCategoryName(name);
        if (existing != null) return existing;
        Category category = new Category();
        category.setCategoryName(name);
        return repository.save(category);
    }

    private Product product(String name, String description, int quantity, double price,
                            double discount, Category category, User seller, String image) {
        Product product = new Product();
        product.setProductName(name);
        product.setDescription(description);
        product.setQuantity(quantity);
        product.setPrice(price);
        product.setDiscount(discount);
        product.setSpecialPrice(price - (price * discount / 100));
        product.setCategory(category);
        product.setUser(seller);
        product.setImage("http://localhost:5000/sample-products/" + image);
        return product;
    }

    private String realImageFor(String productName) {
        return switch (productName) {
            case "Tai nghe Bluetooth chống ồn H1" -> "headphones-real.jpg";
            case "Điện thoại Nova X5 128GB" -> "phone-real.jpg";
            case "Đồng hồ thông minh S9" -> "watch-real.jpg";
            case "Giày sneaker basic unisex" -> "sneaker-real.jpg";
            case "Đèn bàn LED chống cận" -> "lamp-real.jpg";
            case "Bàn phím cơ không dây K68" -> "keyboard-real.jpg";
            case "Loa Bluetooth Mini Pro" -> "speaker-real.jpg";
            case "Balo laptop chống nước 15.6 inch" -> "backpack-real.jpg";
            default -> null;
        };
    }
}
