import * as api from '../api';

export const getCart = async () => {
    try {
        const { data } = await api.fetchCart();
        return data.products;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const addToCart = async (product_id, quantity) => {
    try {
        const { data } = await api.addToCart(product_id, quantity);
        return data.products;
    } catch (error) {
        console.log(error);
    }
}

export const removeFromCart = async (product_id) => {
    try {
        const { data } = await api.removeFromCart(product_id);
        return data.products;
    } catch (error) {
        console.log(error);
    }
}

export const updateCartItem = async (product_id, quantity) => {
    try {
        const { data } = await api.updateCartItem(product_id, quantity);
        return data.products;
    } catch (error) {
        console.log(error);
    }
}
