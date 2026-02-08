import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchOrderHistory } from "../../actions/orders";
import styles from './order.module.css';
import { Link } from "react-router-dom";

const Order = () => {
    const dispatch = useDispatch();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dispatch(fetchOrderHistory((data) => {
            setOrders(data);
            setLoading(false);
        }, (err) => {
            console.log(err);
            setLoading(false);
        }));
    }, [dispatch]);

    if (loading) return <div className={styles.wrapper}>Loading...</div>;

    return (
        <div className={styles.wrapper}>
            <div className={'heading-wrapper'}>
                <h1 className={'heading'}>Your Orders</h1>
            </div>
            {orders.length === 0 ? (
                <div>No orders found.</div>
            ) : (
                <div className={styles.ordersList}>
                    {orders.map(order => (
                        <div key={order.order_id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <span>Order ID: {order.order_id}</span>
                                <span>Status: {order.status}</span>
                                <span>Date: {new Date(order.ordered_at).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.orderTotal}>
                                Total: {order.total} ₹
                            </div>
                            <Link to={`/orders/${order.order_id}`} className="btn1">View Details</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Order;
