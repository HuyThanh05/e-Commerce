package com.ecommerce.sb_ecom.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressDTO {
    private Long addressId;

    @NotBlank(message = "Street is required")
    @Size(min = 5, message = "Street must contain at least 5 characters")
    private String street;

    @NotBlank(message = "Building name is required")
    @Size(min = 5, message = "Building name must contain at least 5 characters")
    private String buildingName;

    @NotBlank(message = "City is required")
    @Size(min = 4, message = "City must contain at least 4 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, message = "State must contain at least 2 characters")
    private String state;

    @NotBlank(message = "Country is required")
    @Size(min = 2, message = "Country must contain at least 2 characters")
    private String country;

    @NotBlank(message = "Pincode is required")
    @Size(min = 5, message = "Pincode must contain at least 5 characters")
    private String pincode;
}
