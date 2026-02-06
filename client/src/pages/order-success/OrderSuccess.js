import styles from "./orderSuccess.module.css";
import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <div className={styles.wrapper}>
      <h1>🎉 Order Placed Successfully!</h1>
      <p>Your payment was completed and order is confirmed.</p>

      <div className={styles.actions}>
        <Link to="/products" className="btn1">Continue Shopping</Link>
        <Link to="/orders" className="btn1">View Orders</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
