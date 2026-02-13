import * as api from "../api";
import {SHIPPING_FETCH, SHIPPING_FETCH_ALL} from "../constants/actions/shipping";

export const fetchShipments = (page, onSuccess) => async (dispatch) => {
    try {
        const shippingData = await api.fetchShipments(page).then(res => res.data);
        dispatch({type: SHIPPING_FETCH_ALL, data: shippingData});
        onSuccess();
    } catch (e) {
        console.log(e);
    }
}

export const fetchShipment = (id, onSuccess, onError) => async (dispatch) => {
    try {
        const shipmentData = await api.fetchShipment(id).then(res => res.data);
        dispatch({type: SHIPPING_FETCH, data: shipmentData})
        onSuccess(shipmentData);
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || 'Failed to fetch shipment details';
        onError({ message: errorMessage });
    }
}

export const updateShipment = (id, status, onSuccess, onError) => async () => {
    try {
        await api.updateShipment(id, status);
        onSuccess();
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || 'Failed to update shipment';
        onError({ message: errorMessage });
    }
}