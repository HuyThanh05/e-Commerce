const initialState = {
  cart: [],
  totalPrice: 0,
  cartId: null,
  selectedProductIds: [],
};

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_CART": {
      const productToAdd = action.payload;
      const existingProduct = state.cart.find(
        (item) => item.productId === productToAdd.productId,
      );

      if (existingProduct) {
        const updatedCart = state.cart.map((item) => {
          if (item.productId === productToAdd.productId) {
            return productToAdd;
          } else {
            return item;
          }
        });

        return {
          ...state,
          cart: updatedCart,
          selectedProductIds: state.selectedProductIds.includes(productToAdd.productId)
            ? state.selectedProductIds : [...state.selectedProductIds, productToAdd.productId],
        };
      } else {
        const newCart = [...state.cart, productToAdd];
        return {
          ...state,
          cart: newCart,
          selectedProductIds: [...state.selectedProductIds, productToAdd.productId],
        };
      }
    }
    case "REMOVE_CART":
      return {
        ...state,
        cart: state.cart.filter(
          (item) => item.productId !== action.payload.productId,
        ),
        selectedProductIds: state.selectedProductIds.filter((id) => id !== action.payload.productId),
      };
    case "GET_USER_CART_PRODUCTS":
      return {
        ...state,
        cart: action.payload,
        totalPrice: action.totalPrice,
        cartId: action.cartId,
        selectedProductIds: state.selectedProductIds.length
          ? state.selectedProductIds.filter((id) => action.payload.some((item) => item.productId === id))
          : action.payload.map((item) => item.productId),
      };
    case "TOGGLE_CART_SELECTION":
      return { ...state, selectedProductIds: state.selectedProductIds.includes(action.payload)
        ? state.selectedProductIds.filter((id) => id !== action.payload)
        : [...state.selectedProductIds, action.payload] };
    case "SELECT_ALL_CART_ITEMS":
      return { ...state, selectedProductIds: action.payload ? state.cart.map((item) => item.productId) : [] };
    case "CLEAR_CART":
      return { cart: [], totalPrice: 0, cartId: null, selectedProductIds: [] };
    default:
      return state;
  }
};
