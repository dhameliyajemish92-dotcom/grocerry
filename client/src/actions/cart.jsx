import * as api from '../api';

export const setCart = (data) => ({
    type: 'SET_CART',
    data
});

export const addToCartAction = (data) => ({
    type: 'ADD_TO_CART',
    data
});

export const removeFromCartAction = (product_id) => ({
    type: 'REMOVE_FROM_CART',
    data: product_id
});

export const updateCartQuantityAction = (product_id, quantity) => ({
    type: 'UPDATE_CART_QUANTITY',
    data: { product_id, quantity }
});

export const clearCartAction = () => ({
    type: 'CLEAR_CART'
});

export const getCartAsync = () => {
    return async (dispatch) => {
        try {
            const { data } = await api.fetchCart();
            dispatch(setCart(data.products));
            return data.products;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
                return [];
            }
            console.log(error);
            return [];
        }
    }
}

export const addToCartAsync = (product_id, quantity) => {
    return async (dispatch) => {
        try {
            const { data } = await api.addToCart(product_id, quantity);
            dispatch(setCart(data.products));
            return data.products;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
                return;
            }
            console.log(error);
        }
    }
}

export const removeFromCartAsync = (product_id) => {
    return async (dispatch) => {
        try {
            const { data } = await api.removeFromCart(product_id);
            dispatch(setCart(data.products));
            return data.products;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
                return;
            }
            console.log(error);
        }
    }
}

export const updateCartItemAsync = (product_id, quantity) => {
    return async (dispatch) => {
        try {
            const { data } = await api.updateCartItem(product_id, quantity);
            dispatch(setCart(data.products));
            return data.products;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
                return;
            }
            console.log(error);
        }
    }
}