import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/orders`)
      .then(res => setOrders(res.data))
      .catch(console.log);
  }, []);

  if (!orders.length) {
    return <h2 style={{textAlign:"center"}}>No orders yet</h2>;
  }

  return (
    <div style={{padding:40}}>
      <h1>My Orders</h1>

      {orders.map(o => (
        <div key={o.order_id} style={{
          border:"1px solid #ddd",
          padding:15,
          marginBottom:15,
          borderRadius:8
        }}>
          <p><b>Order ID:</b> {o.order_id}</p>
          <p><b>Total:</b> ₹ {o.total}</p>
          <p><b>Status:</b> {o.status || "Paid"}</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
