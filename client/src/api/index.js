import axios from "axios";
import {
  ORDERS_BASEURL,
  PAYMENTS_BASEURL,
  PRODUCTS_BASEURL,
  SHIPPING_BASEURL,
  USER_BASEURL
} from "./BaseURLs";

/* ================= AXIOS INSTANCE ================= */

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

/* ================= AUTO TOKEN INJECT ================= */

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

/* ================= PRODUCTS ================= */

export const getProductsPerPage = (page, category) =>
  API.get(`${PRODUCTS_BASEURL}?page=${page}${category ? `&category=${category}` : ""}`);

export const productsSearch = (search, page) =>
  API.get(`${PRODUCTS_BASEURL}/search?search=${search}&page=${page}`);

export const getRecommendations = () =>
  API.get(`${PRODUCTS_BASEURL}/recommendations`);

export const postProduct = (product) =>
  API.post(`${PRODUCTS_BASEURL}`, product);

export const adminUpdateDatabase = (csv, mode) =>
  API.patch(`${PRODUCTS_BASEURL}`, { csv, mode });

export const validateCart = (cart) =>
  API.post(`${PRODUCTS_BASEURL}/cart`, { cart });

/* ================= WISHLIST ================= */

export const getWishlist = () =>
  API.get(`${USER_BASEURL}/wishlist`);

export const updateWishlist = (product_id) =>
  API.patch(`${USER_BASEURL}/wishlist`, { product_id });

/* ================= SHIPPING ================= */

export const fetchShipments = (page) =>
  API.get(`${SHIPPING_BASEURL}?page=${page}`);

export const fetchShipment = (id) =>
  API.get(`${SHIPPING_BASEURL}/${id}`);

export const updateShipment = (id, status) =>
  API.patch(`${SHIPPING_BASEURL}/${id}`, { status });

/* ================= ORDERS ================= */

export const createOrder = (orderData) =>
  API.post(`${ORDERS_BASEURL}`, orderData);

export const fetchOrders = (page) =>
  API.get(`${ORDERS_BASEURL}?page=${page}`);

export const fetchOrder = (id) =>
  API.get(`${ORDERS_BASEURL}/${id}`);

export const updateOrder = (id, status) =>
  API.patch(`${ORDERS_BASEURL}/${id}`, { status });

/* ================= PAYMENT ================= */

export const processPayment = (token, data) =>
  API.post(`${PAYMENTS_BASEURL}`, { token, data });

/* ================= AUTH ================= */

export const authLogin = (email, password) =>
  API.post(`${USER_BASEURL}/login`, { email, password });

export default API;
