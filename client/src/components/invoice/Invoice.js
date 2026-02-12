import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../../actions/orders';
import Loading from '../loading/Loading';
import styles from './Invoice.module.css';
import Logo from '../../shared/assets/logo.png';

const Invoice = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const order = useSelector(state => state.orders.fetched);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const onSuccess = () => setLoading(false);
        const onError = () => {
            setLoading(false);
            navigate('/404');
        };

        if (order && order.order_id === id) {
            setLoading(false);
        } else {
            dispatch(fetchOrder(id, onSuccess, onError));
        }
    }, [dispatch, id, navigate, order]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <Loading />;
    if (!order) return <div>Order not found</div>;

    const products = order.products || [];

    const taxRate = 0.05; // 5% total tax (inclusive)
    const grandTotal = order.total || products.reduce((acc, p) => acc + (p.price * (p.quantity || 1)), 0);
    const subtotal = grandTotal / (1 + taxRate);
    const totalTax = grandTotal - subtotal;
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    return (
        <div className={styles.container}>
            <div className={styles.actions}>
                <button onClick={() => navigate(-1)} className="btn2">Back</button>
                <button onClick={handlePrint} className="btn1">Print Invoice</button>
            </div>

            <div className={styles.invoiceWrapper}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.brand}>
                        <img src={Logo} alt="Grocery Logo" className={styles.logo} />
                        <div className={styles.storeInfo}>
                            <h1>Grocery</h1>
                            <p>Fresh Groceries Delivered</p>
                            <p>123 Green Street, Market District</p>
                            <p>Mumbai, Maharashtra 400001</p>
                            <p><strong>GSTIN:</strong> 27AAPCR1234F1Z5</p>
                        </div>
                    </div>
                    <div className={styles.invoiceTitle}>
                        <h2>TAX INVOICE</h2>
                    </div>
                </header>

                {/* Info Section */}
                <section className={styles.infoSection}>
                    <div className={styles.billTo}>
                        <h3>Bill To:</h3>
                        <p><strong>{order.name?.first} {order.name?.last}</strong></p>
                        <p>{order.address?.area}, {order.address?.street}</p>
                        <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                        <p>Phone: {order.phone_number}</p>
                        <p>Email: {order.email}</p>
                    </div>
                    <div className={styles.orderMeta}>
                        <p><strong>Invoice No:</strong> INV-{order.order_id}</p>
                        <p><strong>Order ID:</strong> {order.order_id}</p>
                        <p><strong>Date:</strong> {new Date(order.ordered_at).toLocaleDateString()}</p>
                        <p><strong>Payment:</strong> {order.payment_method || 'PAID'}</p>
                    </div>
                </section>

                {/* Table */}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th colSpan="2">Description</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item, index) => {
                            const quantity = item.quantity || 1;
                            const price = item.price || 0;
                            const itemTotal = price * quantity;
                            const packaging = item.packaging ? `${item.packaging.quantity} ${item.packaging.unit}` : '';

                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className={styles.imageCell}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={styles.productImage}
                                            onError={(e) => { e.target.src = '/shared/assets/tracking/order.png'; }}
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.productName}>
                                            {item.brand && <span className={styles.brandTag}>{item.brand}</span>} {item.name}
                                        </div>
                                        {packaging && <div className={styles.packagingInfo}>{packaging}</div>}
                                    </td>
                                    <td>₹{price.toFixed(2)}</td>
                                    <td>{quantity}</td>
                                    <td>₹{itemTotal.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Summary */}
                <div className={styles.summaryContainer}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryRow}>
                            <span>Taxable Value:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>CGST (2.5%):</span>
                            <span>₹{cgst.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>SGST (2.5%):</span>
                            <span>₹{sgst.toFixed(2)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                            <span>Total (Incl. Tax):</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <p>Thank you for choosing Grocery!</p>
                    <p>Computer Generated Invoice - No Signature Required</p>
                </footer>
            </div>
        </div>
    );
};

export default Invoice;
