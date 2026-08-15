package com.ecommerce.sb_ecom.repositories;

import com.ecommerce.sb_ecom.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    Optional<Address> findByAddressIdAndUserUserId(Long addressId, Long userId);

    Optional<Address> findByAddressIdAndUserEmail(Long addressId, String email);
}
