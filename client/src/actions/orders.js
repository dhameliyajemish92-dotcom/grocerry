import * as api from '../api/index';
import { ORDERS_FETCH, ORDERS_FETCH_ALL } from "../constants/actions/orders";

export const fetchOrderHistory = (onSuccess, onError) => async (dispatch) => {
    try {
        const orders = await api.fetchOrderHistory().then(res => res.data);
        onSuccess(orders);
    } catch (e) {
        onError(e);
    }
}

export const fetchOrder = (id, onSuccess, onError) => async (dispatch) => {
    try {
        const orderData = await api.fetchOrder(id).then(res => res.data);
        dispatch({ type: ORDERS_FETCH, data: orderData })
        onSuccess(orderData);
    } catch (e) {
        onError(e.response.data);
    }
}

export const updateOrder = (id, status, onSuccess, onError) => async () => {
    try {
        await api.updateOrder(id, status);
        onSuccess();
    } catch (e) {
        onError(e.response.data);
    }
}

export const fetchOrders = (page, onSuccess, onError) => async (dispatch) => {
    try {
        const ordersData = await api.fetchOrders(page).then(res => res.data);
        dispatch({ type: ORDERS_FETCH_ALL, data: ordersData });
        onSuccess();
    } catch (e) {
        onError(e);
    }
}

export const postOrder = (token, data, onSuccess, onError) => async () => {
    try {
        const resData = await api.processPayment(token, data).then(res => res.data);
        onSuccess(resData);
    } catch (e) {
        if (e.response && e.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
            return;
        }
        onError(e);
    }
}

export const verifyRazorpayPayment = (paymentData, onSuccess, onError) => async () => {
    try {
        const { order_id } = await api.verifyRazorpayPayment(paymentData).then(res => res.data);
        onSuccess(order_id);
    } catch (e) {
        onError(e);
    }
}

export const postOrderCOD = (token, data, onSuccess, onError) => async () => {
    try {
        const { order_id } = await api.createOrderCOD(token, data).then(res => res.data);
        onSuccess(order_id);
    } catch (e) {
        if (e.response && e.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
            return;
        }
        onError(e);
    }
}