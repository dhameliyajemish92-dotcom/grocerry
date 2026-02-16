import * as api from "../api";
import { LOGIN, LOGOUT, UPDATE_WISHLIST } from "../constants/actions/authentication";

export const authLogin = (email, password, onSuccess, onError) => async (dispatch) => {
    try {
        const loginData = await api.authLogin(email, password).then(res => res.data);
        dispatch({ type: LOGIN, data: loginData });
        onSuccess();
    } catch (e) {
        onError(e.response ? e.response.data : { message: "Server Error" });
    }
}

export const logout = async (dispatch) => {
    dispatch({ type: LOGOUT });
}

export const verifyUser = (onSuccess, onError) => async () => {
    try {
        const verificationData = await api.verify().then(res => res.data);
        onSuccess(verificationData);
    } catch (e) {
        onError(e);
    }
}

export const updateWishlist = (product_id, onError) => async (dispatch) => {
    try {
        const wishlistData = await api.userUpdateWishlist(product_id).then(res => res.data);
        dispatch({ type: UPDATE_WISHLIST, data: wishlistData.wishlist });
    } catch (e) {
        onError(e);
    }
}

export const getWishlist = (onSuccess, onError) => async () => {
    try {
        const wishlist = await api.getWishlist().then(res => res.data);
        onSuccess(wishlist);
    } catch (e) {
        onError(e);
    }
}

export const authSignup = (formData, onSuccess, onError) => async (dispatch) => {
    try {
        const data = await api.authSignup(formData).then(res => res.data);
        onSuccess(data);
    } catch (e) {
        onError(e.response ? e.response.data : { message: "Server Error" });
    }
}

export const verifyOtp = (email, otp, onSuccess, onError) => async (dispatch) => {
    try {
        const data = await api.verifyOtp(email, otp).then(res => res.data);
        dispatch({ type: LOGIN, data: data });
        onSuccess();
    } catch (e) {
        onError(e.response ? e.response.data : { message: "Server Error" });
    }
}

export const forgotPassword = (email, onSuccess, onError) => async () => {
    try {
        const data = await api.forgotPassword(email).then(res => res.data);
        onSuccess(data);
    } catch (e) {
        onError(e.response ? e.response.data : { message: "Server Error" });
    }
}

export const resetPassword = (formData, onSuccess, onError) => async () => {
    try {
        const data = await api.resetPassword(formData).then(res => res.data);
        onSuccess(data);
    } catch (e) {
        onError(e.response ? e.response.data : { message: "Server Error" });
    }
}