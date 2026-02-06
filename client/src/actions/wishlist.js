import * as api from "../api/index";

export const getWishlist = (onSuccess, onError) => async () => {
  try {
    const { data } = await api.getWishlist();
    onSuccess(data);
  } catch (e) {
    onError(e.response?.data || { message: "Wishlist load failed" });
  }
};

export const updateWishlist = (product_id, onError) => async () => {
  try {
    await api.updateWishlist(product_id);
  } catch (e) {
    onError(e.response?.data || { message: "Wishlist update failed" });
  }
};
