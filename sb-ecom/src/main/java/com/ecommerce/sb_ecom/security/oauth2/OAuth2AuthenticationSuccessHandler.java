package com.ecommerce.sb_ecom.security.oauth2;

import com.ecommerce.sb_ecom.model.AppRole;
import com.ecommerce.sb_ecom.model.Role;
import com.ecommerce.sb_ecom.model.User;
import com.ecommerce.sb_ecom.repositories.RoleRepository;
import com.ecommerce.sb_ecom.repositories.UserRepository;
import com.ecommerce.sb_ecom.security.jwt.JwtUtils;
import com.ecommerce.sb_ecom.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${oauth2.frontend.redirect-uri}")
    private String frontendRedirectUri;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository,
                                               RoleRepository roleRepository,
                                               PasswordEncoder passwordEncoder,
                                               JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User googleUser = (OAuth2User) authentication.getPrincipal();
        String email = googleUser.getAttribute("email");
        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendRedirectUri + "?error=email");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> createUser(email, googleUser));
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(UserDetailsImpl.build(user));
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        response.sendRedirect(frontendRedirectUri);
    }

    private User createUser(String email, OAuth2User googleUser) {
        Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("ROLE_USER is not configured"));
        String baseUsername = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9_]", "");
        if (baseUsername.length() < 3) {
            baseUsername = "googleuser";
        }
        if (baseUsername.length() > 20) {
            baseUsername = baseUsername.substring(0, 20);
        }
        String username = baseUsername;
        if (userRepository.existsByUserName(username)) {
            String subject = googleUser.getAttribute("sub");
            String suffix = subject == null ? UUID.randomUUID().toString() : subject;
            String prefix = baseUsername.substring(0, Math.min(11, baseUsername.length()));
            username = prefix + "_" + suffix.substring(0, Math.min(8, suffix.length()));
        }

        User user = new User(username, email, passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRoles(new HashSet<>(Set.of(userRole)));
        return userRepository.save(user);
    }
}
