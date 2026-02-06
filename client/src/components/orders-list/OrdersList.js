import OrderShort from "../order-short/OrderShort";
import styles from './ordersList.module.css';

const OrdersList = ({ orders = [] }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>ID</div>
        <div>Customer</div>
        <div>Items</div>
        <div>Total</div>
        <div>Status</div>
      </div>

      {orders.map((order, i) => (
        <OrderShort key={order.id || i} order={order} />
      ))}
    </div>
  );
};

export default OrdersList;
