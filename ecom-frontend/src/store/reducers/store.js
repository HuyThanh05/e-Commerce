import { configureStore } from "@reduxjs/toolkit";
import { productReducer } from "./ProductReducer";
import { errorReducer } from "./errorReducer";
import { cartReducer } from "./cartReducer";
import { authReducer } from "./authReducer";
import { paymentMethodReducer } from "./paymentMethodReducer";
import { adminReducer } from "./adminReducer";
import { orderReducer } from "./orderReducer";
import { sellerReducer } from "./sellerReducer";
import { wishlistReducer } from "./wishlistReducer";
import { chatReducer } from "./chatReducer";

const user = localStorage.getItem("auth")
  ? JSON.parse(localStorage.getItem("auth"))
  : null;

const cartItems = localStorage.getItem("cartItems")
  ? JSON.parse(localStorage.getItem("cartItems"))
  : [];

const selectedProductIds = localStorage.getItem("selectedCartIds")
  ? JSON.parse(localStorage.getItem("selectedCartIds"))
  : cartItems.map((item) => item.productId);

const selectUserCheckoutAddress = localStorage.getItem("CHECKOUT_ADDRESS")
  ? JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS"))
  : [];

const wishlistItems = localStorage.getItem("wishlistItems")
  ? JSON.parse(localStorage.getItem("wishlistItems"))
  : [];

const initialState = {
  auth: { user: user, selectUserCheckoutAddress },
  carts: { cart: cartItems, selectedProductIds },
  wishlist: { items: wishlistItems },
};

export const store = configureStore({
  reducer: {
    products: productReducer,
    errors: errorReducer,
    carts: cartReducer,
    auth: authReducer,
    payment: paymentMethodReducer,
    admin: adminReducer,
    order: orderReducer,
    seller: sellerReducer,
    wishlist: wishlistReducer,
    chat: chatReducer,
  },
  preloadedState: initialState,
});

export default store;
