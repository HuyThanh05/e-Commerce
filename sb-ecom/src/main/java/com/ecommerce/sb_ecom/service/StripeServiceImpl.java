package com.ecommerce.sb_ecom.service;

import com.ecommerce.sb_ecom.payload.StripePaymentDto;
import com.ecommerce.sb_ecom.exceptions.APIException;
import com.ecommerce.sb_ecom.exceptions.ResourceNotFoundException;
import com.ecommerce.sb_ecom.model.Address;
import com.ecommerce.sb_ecom.model.Cart;
import com.ecommerce.sb_ecom.model.User;
import com.ecommerce.sb_ecom.repositories.AddressRepository;
import com.ecommerce.sb_ecom.repositories.CartRepository;
import com.ecommerce.sb_ecom.util.AuthUtil;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.CustomerSearchResult;
import com.stripe.model.PaymentIntent;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerSearchParams;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.secret.key}")
    private String stripeApiKey;

    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final AuthUtil authUtil;

    public StripeServiceImpl(CartRepository cartRepository, AddressRepository addressRepository, AuthUtil authUtil) {
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.authUtil = authUtil;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Override
    public PaymentIntent paymentIntent(StripePaymentDto stripePaymentDto) throws StripeException {
        User user = authUtil.loggedInUser();
        Cart cart = cartRepository.findCartByEmail(user.getEmail());
        if (cart == null || cart.getCartItems().isEmpty()) {
            throw new APIException("Cannot create a payment for an empty cart");
        }
        long amountInVnd = BigDecimal.valueOf(cart.getTotalPrice())
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
        if (amountInVnd <= 0) {
            throw new APIException("Payment amount must be greater than zero");
        }
        if (stripePaymentDto.getAddress() == null || stripePaymentDto.getAddress().getAddressId() == null) {
            throw new APIException("A valid checkout address is required");
        }
        Address address = addressRepository
                .findByAddressIdAndUserUserId(stripePaymentDto.getAddress().getAddressId(), user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address", "addressId", stripePaymentDto.getAddress().getAddressId()));

        Customer customer;
        // retrieve and check if customer exist
        CustomerSearchParams searchParams = CustomerSearchParams.builder().setQuery("email:'" + user.getEmail() + "'").build();
        CustomerSearchResult customers = Customer.search(searchParams);
        if (customers.getData().isEmpty()) {
            // Create new customer
            CustomerCreateParams customerParams = CustomerCreateParams.builder()
                    .setEmail(user.getEmail())
                    .setName(user.getUserName())
                    .setAddress(
                            CustomerCreateParams.Address.builder()
                                    .setLine1(address.getStreet())
                                    .setCity(address.getCity())
                                    .setState(address.getState())
                                    .setPostalCode(address.getPincode())
                                    .setCountry(address.getCountry())
                                    .build()
                    ).build();
            customer = Customer.create(customerParams);
        } else {
            // fetch the customer that exist
            customer = customers.getData().get(0);
        }
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInVnd)
                .setCurrency("vnd")
                .setCustomer(customer.getId())
                .setDescription("Order for " + user.getEmail())
                .setAutomaticPaymentMethods(PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()).build();
        return PaymentIntent.create(params);
    }
}
