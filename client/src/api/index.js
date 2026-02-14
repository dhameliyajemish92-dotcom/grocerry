import axios from "axios";
import {
    ORDERS_BASEURL,
    PAYMENTS_BASEURL,
    PRODUCTS_BASEURL,
    SHIPPING_BASEURL,
    USER_BASEURL,
    CART_BASEURL,
    ADMIN_BASEURL,
} from "./BaseURLs";

/* ========================= AXIOS INSTANCE ========================= */
const API = axios.create();

/* ========================= AXIOS INTERCEPTOR ========================= */
API.interceptors.request.use(
    (req) => {
        try {
            // Public routes (JWT required nathi)
            const publicRoutes = ["/login", "/signup", "/verify-otp"];

            if (publicRoutes.some(route => req.url?.includes(route))) {
                return req;
            }

            const profile = localStorage.getItem("profile");
            if (!profile) return req;

            const parsedProfile = JSON.parse(profile);
            const token = parsedProfile?.token;

            if (token) {
                req.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Axios Interceptor Error:", error);
        }

        return req;
    },
    (error) => Promise.reject(error)
);

/* ========================= PRODUCTS ========================= */
export const getProductsPerPage = (page, category) =>
    API.get(
        `${PRODUCTS_BASEURL}?page=${page}${category ? `&category=${category}` : ""
        }`
    );

export const productsSearch = (search, page) =>
    API.get(`${PRODUCTS_BASEURL}/search?search=${search}&page=${page}`);

export const getRecommendations = () =>
    API.get(`${PRODUCTS_BASEURL}/recommendations`);

export const postProduct = (product) =>
    API.post(`${PRODUCTS_BASEURL}`, product);

export const adminUpdateDatabase = (csv, mode) =>
    API.patch(`${PRODUCTS_BASEURL}`, { csv, mode });

export const uploadProductsFromPDF = (formData, mode) =>
    API.post(`${PRODUCTS_BASEURL}/pdf-upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

export const validateCart = (cart) =>
    API.post(`${PRODUCTS_BASEURL}/cart`, { cart });

/* ========================= AUTH ========================= */
export const authLogin = (email, password) =>
    API.post(`${USER_BASEURL}/login`, { email, password });

export const authSignup = (formData) =>
    API.post(`${USER_BASEURL}/signup`, formData);

export const verifyOtp = (email, otp) =>
    API.post(`${USER_BASEURL}/verify-otp`, { email, otp });

export const verify = () =>
    API.post(`${USER_BASEURL}/verify`);

export const userUpdateWishlist = (product_id) =>
    API.patch(`${USER_BASEURL}/wishlist`, { product_id });

export const getWishlist = () =>
    API.get(`${USER_BASEURL}/wishlist`);

/* ========================= CART ========================= */
export const fetchCart = () =>
    API.get(`${CART_BASEURL}`);

export const addToCart = (product_id, quantity) =>
    API.post(`${CART_BASEURL}`, { product_id, quantity });

export const removeFromCart = (product_id) =>
    API.delete(`${CART_BASEURL}`, { data: { product_id } });

export const updateCartItem = (product_id, quantity) =>
    API.patch(`${CART_BASEURL}`, { product_id, quantity });

/* ========================= SHIPPING ========================= */
export const fetchShipments = (page) =>
    API.get(`${SHIPPING_BASEURL}?page=${page}`);

export const fetchShipment = (id) =>
    API.get(`${SHIPPING_BASEURL}/${id}`);

export const updateShipment = (id, status) =>
    API.patch(`${SHIPPING_BASEURL}/${id}`, { status });

/* ========================= ORDERS ========================= */
export const fetchOrders = (page) =>
    API.get(`${ORDERS_BASEURL}?page=${page}`);

export const fetchOrderHistory = () =>
    API.get(`${ORDERS_BASEURL}/history`);

export const fetchOrder = (id) =>
    API.get(`${ORDERS_BASEURL}/${id}`);

export const updateOrder = (id, status) =>
    API.patch(`${ORDERS_BASEURL}/${id}`, { status });

export const createOrderAdmin = (data) =>
    API.post(`${ORDERS_BASEURL}/admin`, data);

export const sendReceiptEmail = (orderId) =>
    API.post(`${ORDERS_BASEURL}/${orderId}/send-receipt`);

/* ========================= PAYMENTS ========================= */
// Razorpay / Payment token JWT nathi
export const processPayment = (token, data) =>
    API.post(`${PAYMENTS_BASEURL}`, { token, data });

export const verifyRazorpayPayment = (paymentData) =>
    API.post(`${PAYMENTS_BASEURL}/verify`, paymentData);

// COD order – JWT header interceptor thi jase
export const createOrderCOD = (token, data) =>
    API.post(`${ORDERS_BASEURL}/cod`, { token, data });

/* ========================= ADMIN ========================= */
export const getDashboardStats = () =>
    API.get(`${ADMIN_BASEURL}/dashboard`);

export const getAllUsers = () =>
    API.get(`${ADMIN_BASEURL}/users`);

export const updateUserRole = (userId, role) =>
    API.patch(`${ADMIN_BASEURL}/users/${userId}`, { role });

export const deleteUser = (userId) =>
    API.delete(`${ADMIN_BASEURL}/users/${userId}`);

export const getProduct = (productId) =>
    API.get(`${ADMIN_BASEURL}/products/${productId}`);

export const updateProduct = (productId, data) =>
    API.patch(`${ADMIN_BASEURL}/products/${productId}`, data);

export const deleteProduct = (productId) =>
    API.delete(`${ADMIN_BASEURL}/products/${productId}`);

export default API;
