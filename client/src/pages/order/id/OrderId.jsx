import styles from './orderId.module.css';
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jsPDF } from "jspdf";
import Loading from "../../../components/loading/Loading";
import Order from '../../../shared/assets/tracking/order.png';
import { fetchOrder } from "../../../actions/orders";
import { downloadInvoice, sendInvoiceEmail } from "../../../api/index";

const OrderId = () => {

    const { id } = useParams();
    const order = useSelector(state => state.orders.fetched);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [emailLoading, setEmailLoading] = useState(false);
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

    const getAuthHeader = () => {
        const profile = localStorage.getItem('profile');
        if (profile) {
            const token = JSON.parse(profile)?.token;
            return token ? `Bearer ${token}` : '';
        }
        return '';
    };

    const handleDownloadPDF = async () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            let y = 20;
            
            // Header
            doc.setFillColor(0, 177, 6);
            doc.rect(0, 0, pageWidth, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('TAX INVOICE', pageWidth / 2, 18, { align: 'center' });
            doc.setFontSize(10);
            doc.text('Grocery | GSTIN: 27AAPCR1234F1Z5', pageWidth / 2, 26, { align: 'center' });
            
            y = 40;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text('Invoice Details', 20, y);
            doc.text('Customer Details', 120, y);
            y += 8;
            doc.setFontSize(10);
            doc.text(`Invoice No: INV-${order.order_id}`, 20, y);
            doc.text(`Name: ${order.name?.first} ${order.name?.last}`, 120, y);
            y += 6;
            doc.text(`Date: ${new Date(order.ordered_at).toLocaleDateString()}`, 20, y);
            doc.text(`Email: ${order.email || 'N/A'}`, 120, y);
            y += 6;
            doc.text(`Order ID: #${order.order_id}`, 20, y);
            doc.text(`Phone: ${order.phone_number || 'N/A'}`, 120, y);
            y += 6;
            doc.text(`Payment: ${order.payment_method || 'N/A'}`, 20, y);
            
            y += 15;
            doc.setFillColor(0, 177, 6);
            doc.rect(20, y, 170, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text('S.No', 22, y + 5);
            doc.text('Img', 32, y + 5);
            doc.text('Item', 50, y + 5);
            doc.text('Qty', 105, y + 5);
            doc.text('Rate', 120, y + 5);
            doc.text('Total', 155, y + 5);
            
            y += 15;
            doc.setTextColor(0, 0, 0);
            const products = order.products || [];
            let subtotal = 0;
            
            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                const qty = p.quantity || 1;
                const price = p.price || 0;
                const itemTotal = price * qty;
                subtotal += itemTotal;
                
                doc.setFontSize(8);
                doc.text(String(i + 1), 22, y + 4);
                
                // Try to add product image
                if (p.image) {
                    try {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        await new Promise((resolve) => {
                            img.onload = resolve;
                            img.onerror = resolve;
                            img.src = p.image;
                        });
                        if (img.complete && img.naturalWidth > 0) {
                            doc.addImage(img, 'JPEG', 32, y - 2, 10, 10);
                        }
                    } catch (e) { }
                }
                
                const nameStr = (p.name || 'Item').substring(0, 25);
                doc.text(nameStr, 50, y + 4);
                doc.text(String(qty), 105, y + 4);
                doc.text(`Rs. ${price.toFixed(2)}`, 120, y + 4);
                doc.text(`Rs. ${itemTotal.toFixed(2)}`, 155, y + 4);
                
                y += 12;
            }
            
            // Summary
            y += 10;
            const taxRate = 0.05;
            const taxAmount = subtotal * taxRate;
            const grandTotal = order.total || subtotal + taxAmount;
            
            doc.setFillColor(245, 245, 245);
            doc.rect(120, y, 70, 35, 'F');
            doc.rect(120, y, 70, 35, 'S');
            let sy = y + 8;
            doc.text('Subtotal:', 125, sy);
            doc.text(`Rs. ${(subtotal).toFixed(2)}`, 160, sy, { align: 'right' });
            sy += 7;
            doc.text('CGST (2.5%):', 125, sy);
            doc.text(`Rs. ${(taxAmount / 2).toFixed(2)}`, 160, sy, { align: 'right' });
            sy += 7;
            doc.text('SGST (2.5%):', 125, sy);
            doc.text(`Rs. ${(taxAmount / 2).toFixed(2)}`, 160, sy, { align: 'right' });
            sy += 10;
            doc.setFillColor(0, 177, 6);
            doc.rect(120, sy, 70, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text('Grand Total:', 125, sy + 8);
            doc.text(`Rs. ${grandTotal.toFixed(2)}`, 160, sy + 8, { align: 'right' });
            
            doc.save(`Invoice_${order.order_id}.pdf`);
        } catch (error) {
            console.error('PDF error:', error);
            alert('Failed to generate PDF');
        }
    };

    const handlePrint = async () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            let y = 20;
            
            doc.setFillColor(0, 177, 6);
            doc.rect(0, 0, pageWidth, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('TAX INVOICE', pageWidth / 2, 18, { align: 'center' });
            doc.setFontSize(10);
            doc.text('Grocery | GSTIN: 27AAPCR1234F1Z5', pageWidth / 2, 26, { align: 'center' });
            
            y = 40;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text('Invoice Details', 20, y);
            doc.text('Customer Details', 120, y);
            y += 8;
            doc.setFontSize(10);
            doc.text(`Invoice No: INV-${order.order_id}`, 20, y);
            doc.text(`Name: ${order.name?.first} ${order.name?.last}`, 120, y);
            y += 6;
            doc.text(`Date: ${new Date(order.ordered_at).toLocaleDateString()}`, 20, y);
            doc.text(`Email: ${order.email || 'N/A'}`, 120, y);
            y += 6;
            doc.text(`Order ID: #${order.order_id}`, 20, y);
            doc.text(`Phone: ${order.phone_number || 'N/A'}`, 120, y);
            y += 6;
            doc.text(`Payment: ${order.payment_method || 'N/A'}`, 20, y);
            
            y += 15;
            doc.setFillColor(0, 177, 6);
            doc.rect(20, y, 170, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text('S.No', 22, y + 5);
            doc.text('Img', 32, y + 5);
            doc.text('Item', 50, y + 5);
            doc.text('Qty', 105, y + 5);
            doc.text('Rate', 120, y + 5);
            doc.text('Total', 155, y + 5);
            
            y += 15;
            doc.setTextColor(0, 0, 0);
            const products = order.products || [];
            let subtotal = 0;
            
            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                const qty = p.quantity || 1;
                const price = p.price || 0;
                const itemTotal = price * qty;
                subtotal += itemTotal;
                
                doc.setFontSize(8);
                doc.text(String(i + 1), 22, y + 4);
                
                if (p.image) {
                    try {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        await new Promise((resolve) => {
                            img.onload = resolve;
                            img.onerror = resolve;
                            img.src = p.image;
                        });
                        if (img.complete && img.naturalWidth > 0) {
                            doc.addImage(img, 'JPEG', 32, y - 2, 10, 10);
                        }
                    } catch (e) { }
                }
                
                const nameStr = (p.name || 'Item').substring(0, 25);
                doc.text(nameStr, 50, y + 4);
                doc.text(String(qty), 105, y + 4);
                doc.text(`Rs. ${price.toFixed(2)}`, 120, y + 4);
                doc.text(`Rs. ${itemTotal.toFixed(2)}`, 155, y + 4);
                
                y += 12;
            }
            
            y += 10;
            const taxRate = 0.05;
            const taxAmount = subtotal * taxRate;
            const grandTotal = order.total || subtotal + taxAmount;
            
            doc.setFillColor(245, 245, 245);
            doc.rect(120, y, 70, 35, 'F');
            doc.rect(120, y, 70, 35, 'S');
            let sy = y + 8;
            doc.text('Subtotal:', 125, sy);
            doc.text(`Rs. ${(subtotal).toFixed(2)}`, 160, sy, { align: 'right' });
            sy += 7;
            doc.text('CGST (2.5%):', 125, sy);
            doc.text(`Rs. ${(taxAmount / 2).toFixed(2)}`, 160, sy, { align: 'right' });
            sy += 7;
            doc.text('SGST (2.5%):', 125, sy);
            doc.text(`Rs. ${(taxAmount / 2).toFixed(2)}`, 160, sy, { align: 'right' });
            sy += 10;
            doc.setFillColor(0, 177, 6);
            doc.rect(120, sy, 70, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text('Grand Total:', 125, sy + 8);
            doc.text(`Rs. ${grandTotal.toFixed(2)}`, 160, sy + 8, { align: 'right' });
            
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } catch (error) {
            console.error('Print error:', error);
        }
    };

    const handleEmailPDF = async () => {
        if (emailLoading) return;
        setEmailLoading(true);
        try {
            await sendInvoiceEmail(order.order_id);
            alert('Invoice sent to your email!');
        } catch (error) {
            console.error('Email error:', error);
            alert('Failed to send invoice. Please try again.');
        } finally {
            setEmailLoading(false);
        }
    };

    if (loading)
        return <Loading />

    return (
        <div className={styles['wrapper']}>
            <div className={'heading'}>
                <h1>Track Order</h1>
            </div>

            <div className={styles['sub']}>
                Order <span>#{order.order_id}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap', justifyContent: 'end' }}>
                <button className="btn2" onClick={handleDownloadPDF}>Download PDF</button>
                <button className="btn2" onClick={handlePrint}>Print invoice</button>
                <button className="btn2" onClick={handleEmailPDF} disabled={emailLoading}>
                    {emailLoading ? 'Sending...' : 'Email PDF'}
                </button>
                {order.status === 'FULFILLED' &&
                    <Link className={styles['shipping']} to={`/shipping/${order.order_id}`}>Track Shipping</Link>}
                <Link className="btn1" to="/orders" style={{ fontSize: '0.9em' }}>Back to Orders</Link>

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
                                    ₹{product.price} x {product.quantity || 1}
                                </div>
                            </div>
                            <div className={styles['product-total']}>
                                ₹{(product.price * (product.quantity || 1)).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles['order-total']}>
                    <span>Total:</span>
                    <span>₹{order.total}</span>
                </div>
            </div>


        </div>
    );
}

export default OrderId;