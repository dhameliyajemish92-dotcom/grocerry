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
                        <div key={order.order_id} className={styles.orderCard} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
                            <div className={styles.orderHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span><strong>Order ID:</strong> {order.order_id}</span>
                                <span><strong>Status:</strong> {order.status}</span>
                                <span><strong>Date:</strong> {new Date(order.ordered_at).toLocaleDateString()}</span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <span><strong>Payment Method:</strong> {order.payment_method}</span>
                            </div>
                            <div className={styles.orderTotal} style={{ marginBottom: '10px', fontSize: '1.1em', fontWeight: 'bold' }}>
                                Total: {order.total} ₹
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to={`/orders/${order.order_id}`} className="btn1">View Details</Link>
                                <Link to={`/shipping/${order.order_id}`} className="btn2">Track Shipment</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Order;
