import * as api from '../api/index';
import { ORDERS_FETCH, ORDERS_FETCH_ALL } from "../constants/actions/orders";

export const fetchOrderHistory = (onSuccess, onError) => async (dispatch) => {
    try {
        const orders = await api.fetchOrderHistory().then(res => res.data);
        onSuccess(orders);
    } catch (e) {
        console.error("Fetch Order History error:", e);
        if (onError) onError(e.response?.data || e);
    }
}

export const fetchOrder = (id, onSuccess, onError) => async (dispatch) => {
    try {
        const orderData = await api.fetchOrder(id).then(res => res.data);
        dispatch({ type: ORDERS_FETCH, data: orderData })
        onSuccess(orderData);
    } catch (e) {
        console.error("Fetch Order error:", e);
        if (onError) onError(e.response?.data || e);
    }
}

export const updateOrder = (id, status, onSuccess, onError) => async () => {
    try {
        await api.updateOrder(id, status);
        onSuccess();
    } catch (e) {
        console.error("Update Order error:", e);
        if (onError) onError(e.response?.data || e);
    }
}

export const fetchOrders = (page, onSuccess, onError) => async (dispatch) => {
    try {
        const ordersData = await api.fetchOrders(page).then(res => res.data);
        dispatch({ type: ORDERS_FETCH_ALL, data: ordersData });
        onSuccess();
    } catch (e) {
        console.error("Fetch Orders error:", e);
        if (onError) onError(e.response?.data || e);
    }
}

export const postOrder = (token, data, onSuccess, onError) => async () => {
    try {
        const resData = await api.processPayment(token, data).then(res => res.data);
        onSuccess(resData);
    } catch (e) {
        console.error("Post Order error:", e);
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            localStorage.clear();
            window.location.href = '/login?error=session_expired';
            return;
        }
        if (onError) onError(e.response?.data || e);
    }
}

export const verifyRazorpayPayment = (paymentData, onSuccess, onError) => async () => {
    try {
        const { order_id } = await api.verifyRazorpayPayment(paymentData).then(res => res.data);
        onSuccess(order_id);
    } catch (e) {
        console.error("Verify Razorpay error:", e);
        if (onError) onError(e.response?.data || e);
    }
}

export const postOrderCOD = (token, data, onSuccess, onError) => async () => {
    try {
        const { order_id } = await api.createOrderCOD(token, data).then(res => res.data);
        onSuccess(order_id);
    } catch (e) {
        console.error("Post Order COD error:", e);
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            localStorage.clear();
            window.location.href = '/login?error=session_expired';
            return;
        }
        if (onError) onError(e.response?.data || e);
    }
}