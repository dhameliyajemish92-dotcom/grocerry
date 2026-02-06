import { Link, useSearchParams } from "react-router-dom";
import styles from "./checkout.module.css";

const Success = () => {

  const [params] = useSearchParams();
  const orderId = params.get("order");

  return (
    <div className={styles.wrapper} style={{ textAlign: "center" }}>
      <h1>✅ Payment Successful</h1>

      <p>Your order has been placed successfully</p>

      {orderId && (
        <p><b>Order ID:</b> {orderId}</p>
      )}

      <div style={{ marginTop: 30 }}>
        <Link className="btn1" to="/orders">My Orders</Link>
        <br/><br/>
        <Link to="/products">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default Success;
