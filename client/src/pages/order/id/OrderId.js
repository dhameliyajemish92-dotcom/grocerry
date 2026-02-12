import styles from './orderId.module.css';
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../components/loading/Loading";
import Order from '../../../shared/assets/tracking/order.png';
import { fetchOrder } from "../../../actions/orders";
import { generateOrderPDF } from "../../../utils/pdfGenerator";
import { sendReceiptEmail } from "../../../api";

const OrderId = () => {

    const { id } = useParams();
    const order = useSelector(state => state.orders.fetched);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const onSuccess = () => {
            setLoading(false);
        }

        const onError = (e) => {
            setLoading(false);
            navigate('/404')
        }

        if (order && order.order_id === id)
            onSuccess();
        else
            dispatch(fetchOrder(id, onSuccess, onError))

    }, [dispatch, id, navigate, order]);

    const capitalizeFirst = (m) => {
        return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
    }

    const getProgress = () => {
        switch (order?.status) {
            case 'PROCESSING':
                return 50;
            case 'FULFILLED':
                return 100;
            default:
                return 5
        }
    }

    const handleDownloadPDF = () => {
        if (!order) {
            console.log('No order data available');
            return;
        }
        console.log('Generating PDF for order:', order);
        console.log('Order products:', order.products);
        generateOrderPDF(order);
    }

    const handleSendEmail = () => {
        if (!order) return;
        setEmailLoading(true);
        setEmailMessage('');
        sendReceiptEmail(order.order_id)
            .then(() => {
                setEmailMessage('Invoice sent to your email!');
                setEmailLoading(false);
            })
            .catch(() => {
                setEmailMessage('Failed to send email');
                setEmailLoading(false);
            });
    }

    if (loading)
        return <Loading />

    return (
        <div className={styles['wrapper']}>
            <div className={'heading'}>
                <h1>Track Order</h1>
            </div>
            <div className={styles['pdf-button-wrapper']}>
                <button
                    onClick={handleDownloadPDF}
                    className={`btn2 ${styles['pdf-btn']}`}
                >
                    Download PDF
                </button>
                <button
                    onClick={() => navigate(`/orders/${id}/invoice`)}
                    className={`btn1 ${styles['print-btn']}`}
                    style={{ marginLeft: '10px' }}
                >
                    Print Invoice
                </button>
                <button
                    onClick={handleSendEmail}
                    className={`btn2 ${styles['email-btn']}`}
                    disabled={emailLoading}
                    style={{ marginLeft: '10px' }}
                >
                    {emailLoading ? 'Sending...' : 'Send Email'}
                </button>
            </div>
            {emailMessage && <div className={styles['email-message']}>{emailMessage}</div>}
            <div className={styles['sub']}>
                Order <span>#{order.order_id}</span>
            </div>
            <div className={styles['full-progress']}>
                <div className={styles['progress']} style={{ width: getProgress() + '%' }}>
                    <img className={styles['img']}
                        style={{ transform: order.status === 'CANCELLED' ? 'scaleX(-1)' : '' }} src={Order}
                        alt={'Order'} />
                </div>
            </div>
            <div className={styles['status']}>
                <span className={styles['update']}>Order Update:</span> Your order has
                been {capitalizeFirst(order.status)}.
            </div>

            <div className={styles['products-section']}>
                <h2 className={styles['products-heading']}>Items Ordered</h2>
                <div className={styles['products-list']}>
                    {order.products && order.products.map((product, index) => (
                        <div key={index} className={styles['product-item']}>
                            <div className={styles['product-image']}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) => { e.target.src = '/images/grocery/Beverages/black_tea_packet_001.jpg'; }}
                                />
                            </div>
                            <div className={styles['product-details']}>
                                <div className={styles['product-name']}>{product.name}</div>
                                <div className={styles['product-price']}>
                                    {product.price} x {product.quantity || 1}
                                </div>
                            </div>
                            <div className={styles['product-total']}>
                                {(product.price * (product.quantity || 1)).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles['order-total']}>
                    <span>Total:</span>
                    <span>{order.total}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {order.status === 'FULFILLED' &&
                    <Link className={styles['shipping']} to={`/shipping/${order.order_id}`}>Track Shipping</Link>}
                <Link className="btn1" to="/orders" style={{ fontSize: '0.9em' }}>Back to Orders</Link>
            </div>
        </div>
    );
}

export default OrderId;