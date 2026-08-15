package com.ecommerce.sb_ecom.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.sb_ecom.exceptions.APIException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CloudinaryImageService {
    private static final long MAX_IMAGE_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");

    private final Cloudinary cloudinary;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryImageService(
            Cloudinary cloudinary,
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        this.cloudinary = cloudinary;
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public ImageUploadResult uploadProductImage(MultipartFile file) throws IOException {
        validateConfiguration();
        validateImage(file);

        String publicId = "product-" + UUID.randomUUID();
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "image",
                "folder", "ecommerce/products",
                "public_id", publicId,
                "overwrite", false));

        Object secureUrl = result.get("secure_url");
        Object uploadedPublicId = result.get("public_id");
        if (secureUrl == null || uploadedPublicId == null) {
            throw new APIException("Cloudinary did not return image identifiers");
        }
        return new ImageUploadResult(secureUrl.toString(), uploadedPublicId.toString());
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        validateConfiguration();
        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                "resource_type", "image",
                "invalidate", true));
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new APIException("Image file must not be empty");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new APIException("Image file must not exceed 5 MB");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new APIException("Only JPEG, PNG, and WebP images are supported");
        }
    }

    private void validateConfiguration() {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new APIException("Cloudinary credentials are not configured");
        }
    }
}
