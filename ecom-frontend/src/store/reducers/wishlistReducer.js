const initialState = { items: [] };

export const wishlistReducer = (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_WISHLIST": {
      const exists = state.items.some((item) => item.productId === action.payload.productId);
      return { ...state, items: exists ? state.items.filter((item) => item.productId !== action.payload.productId) : [...state.items, action.payload] };
    }
    case "REMOVE_WISHLIST": return { ...state, items: state.items.filter((item) => item.productId !== action.payload) };
    default: return state;
  }
};
