import * as api from "../api";
import { SHIPPING_FETCH, SHIPPING_FETCH_ALL } from "../constants/actions/shipping";

/* ===== FETCH ALL SHIPMENTS ===== */

export const fetchShipments = (page, onSuccess) => async (dispatch) => {
  try {
    const { data } = await api.fetchShipments(page);
    dispatch({ type: SHIPPING_FETCH_ALL, data });
    onSuccess(data);
  } catch (e) {
    console.log(e.response?.data || e);
  }
};

/* ===== FETCH SINGLE SHIPMENT ===== */

export const fetchShipment = (id, onSuccess, onError) => async (dispatch) => {
  try {
    const { data } = await api.fetchShipment(id);
    dispatch({ type: SHIPPING_FETCH, data });
    onSuccess(data);
  } catch (e) {
    onError(e.response?.data || { message: "Failed to fetch shipment" });
  }
};

/* ===== UPDATE SHIPMENT ===== */

export const updateShipment = (id, status, onSuccess, onError) => async () => {
  try {
    await api.updateShipment(id, status);
    onSuccess();
  } catch (e) {
    onError(e.response?.data || { message: "Failed to update shipment" });
  }
};
