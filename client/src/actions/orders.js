import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ================= CREATE ORDER ================= */

export const postOrder = (token, data, onSuccess, onError) => async () => {
  try {
    const res = await axios.post(
      `${API}/orders`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    onSuccess && onSuccess(res.data);

  } catch (err) {
    onError && onError(err.response?.data || { message: "Order failed" });
  }
};

/* ================= FETCH SINGLE ORDER ================= */

export const fetchOrder = (id, token) => async () => {
  return axios.get(`${API}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/* ================= FETCH ALL ORDERS ================= */

export const fetchOrders = (token) => async () => {
  return axios.get(`${API}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

/* ================= UPDATE ORDER ================= */

export const updateOrder = (id, status, token) => async () => {
  return axios.patch(
    `${API}/orders/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};
