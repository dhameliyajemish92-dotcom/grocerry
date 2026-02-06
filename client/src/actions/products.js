import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

/* =======================
   GET PRODUCTS
======================= */

export const getProductsPerPage = (page, category, onSuccess) => async () => {
  try {
    let url = "/products";

    if (category) {
      url += `?category=${category}`;
    }

    const res = await API.get(url);
    onSuccess(res.data);
  } catch (err) {
    console.log(err);
  }
};

export const productsSearch = (search, page, onSuccess) => async () => {
  try {
    const res = await API.get(`/products/search?search=${search}`);
    onSuccess(res.data);
  } catch (err) {
    console.log(err);
  }
};

/* =======================
   ADMIN – ADD PRODUCT
======================= */

export const postProduct = (product) => async () => {
  try {
    await API.post("/products", product);
  } catch (err) {
    console.log(err);
  }
};

/* =======================
   ADMIN – UPDATE DATABASE
======================= */

export const adminUpdateDatabase = (data) => async () => {
  try {
    await API.post("/admin/products", data);
  } catch (err) {
    console.log(err);
  }
};

/* =======================
   CART VALIDATION
======================= */

export const validateCart = (cart, onSuccess, onError) => async () => {
  try {
    const res = await API.post("/products/validate", { cart });
    onSuccess(res.data);
  } catch (err) {
    if (onError) onError(err.response?.data);
  }
};
