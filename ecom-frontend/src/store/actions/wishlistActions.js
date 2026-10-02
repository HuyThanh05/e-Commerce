export const toggleWishlist = (product, toast) => (dispatch, getState) => {
  const exists = getState().wishlist.items.some((item) => item.productId === product.productId);
  dispatch({ type: "TOGGLE_WISHLIST", payload: product });
  localStorage.setItem("wishlistItems", JSON.stringify(getState().wishlist.items));
  toast?.success(exists ? "Đã xóa khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");
};

export const removeWishlistItem = (productId, toast) => (dispatch, getState) => {
  dispatch({ type: "REMOVE_WISHLIST", payload: productId });
  localStorage.setItem("wishlistItems", JSON.stringify(getState().wishlist.items));
  toast?.success("Đã xóa khỏi danh sách yêu thích");
};
