import * as api from '../api';
import { DASHBOARD_STATS } from "../constants/actions/admin";

/**
 * Fetch Dashboard Statistics
 */
export const fetchDashboardStats = (onSuccess, onError) => async (dispatch) => {
    try {
        const { data } = await api.getDashboardStats();
        dispatch({ type: DASHBOARD_STATS, data });
        onSuccess(data);
    } catch (e) {
        console.error("Dashboard Stats Error:", e);
        onError(e.response?.data || e);
    }
};

/**
 * Fetch All Users (Admin)
 */
export const fetchAllUsers = (onSuccess, onError) => async () => {
    try {
        const { data } = await api.getAllUsers();
        onSuccess(data);
    } catch (e) {
        onError(e.response?.data || e);
    }
};

/**
 * Update User Role (Admin)
 */
export const adminUpdateUserRole = (userId, role, onSuccess, onError) => async () => {
    try {
        const { data } = await api.updateUserRole(userId, role);
        onSuccess(data);
    } catch (e) {
        onError(e.response?.data || e);
    }
};

/**
 * Delete User (Admin)
 */
export const adminDeleteUser = (userId, onSuccess, onError) => async () => {
    try {
        await api.deleteUser(userId);
        onSuccess();
    } catch (e) {
        onError(e.response?.data || e);
    }
};

/**
 * Get Single Product (Admin)
 */
export const fetchAdminProduct = (productId, onSuccess, onError) => async () => {
    try {
        const { data } = await api.getProduct(productId);
        onSuccess(data);
    } catch (e) {
        onError(e.response?.data || e);
    }
};

/**
 * Update Product (Admin)
 */
export const adminUpdateProduct = (productId, productData, onSuccess, onError) => async () => {
    try {
        const { data } = await api.updateProduct(productId, productData);
        onSuccess(data);
    } catch (e) {
        onError(e.response?.data || e);
    }
};

/**
 * Delete Product (Admin)
 */
export const adminDeleteProduct = (productId, onSuccess, onError) => async () => {
    try {
        await api.deleteProduct(productId);
        onSuccess();
    } catch (e) {
        onError(e.response?.data || e);
    }
};

/**
 * Create Order (Admin)
 */
export const createOrderAdmin = (orderData, onSuccess, onError) => async () => {
    try {
        const { data } = await api.createOrderAdmin(orderData);
        onSuccess(data);
    } catch (e) {
        onError(e.response?.data || e);
    }
};
