package com.ecommerce.sb_ecom.payload;

import com.ecommerce.sb_ecom.security.response.UserInfoResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseCookie;

@Data
@AllArgsConstructor
public class AuthenticationResult {
    private final UserInfoResponse response;
    private final ResponseCookie  jwtCookie;
}
