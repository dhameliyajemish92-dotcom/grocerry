import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../../components/loading/Loading";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrder } from "../../actions/orders";
import { sendReceiptEmail } from "../../api";
import { jsPDF } from "jspdf";
import styles from './checkout.module.css';

const Success = ({ setCart }) => {

    const [searchParams] = useSearchParams();
    const order_id = searchParams.get('order');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const order = useSelector(state => state.orders.fetched);
    const [loading, setLoading] = useState(true);
    const [emailSending, setEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');


    useEffect(() => {
        const onSuccess = () => {
            setLoading(false);
            setCart([]);
            localStorage.removeItem('cart');
        }

        const onError = () => {
            setLoading(false);
        }

        if (order_id) {
            dispatch(fetchOrder(order_id, onSuccess, onError));
        }
    }, [dispatch, order_id, setCart])

    const handleDownloadReceipt = () => {
        if (!order) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const GST_RATE = 5; // 5% GST

        // Header
        doc.setFillColor(0, 177, 6);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('TAX INVOICE', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Grocery Store', pageWidth / 2, 28, { align: 'center' });
        doc.setFontSize(8);
        doc.text('GSTIN: 24XXXXX1234X1ZX', pageWidth / 2, 35, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        let y = 52;

        // Invoice Info - Two columns
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Invoice Details', 15, y);
        doc.text('Customer Details', pageWidth / 2 + 5, y);
        y += 7;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);

        // Left column - Invoice details
        doc.text(`Invoice No: INV-${order.order_id}`, 15, y);
        doc.text(`Name: ${order.name.first} ${order.name.last}`, pageWidth / 2 + 5, y);
        y += 5;
        doc.text(`Date: ${new Date(order.ordered_at || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, y);
        if (order.email) {
            doc.text(`Email: ${order.email}`, pageWidth / 2 + 5, y);
        }
        y += 5;
        doc.text(`Order ID: #${order.order_id}`, 15, y);
        doc.text(`Phone: ${order.phone_number}`, pageWidth / 2 + 5, y);
        y += 5;
        doc.text(`Payment: ${order.payment_method || 'N/A'}`, 15, y);
        if (order.address) {
            const addr = order.address;
            doc.text(`Address: ${addr.street || ''}, ${addr.area || ''}`, pageWidth / 2 + 5, y);
            y += 5;
            doc.text(`Status: ${order.status}`, 15, y);
            doc.text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, pageWidth / 2 + 5, y);
        }
        y += 10;

        // Separator line
        doc.setDrawColor(0, 177, 6);
        doc.setLineWidth(0.5);
        doc.line(15, y, pageWidth - 15, y);
        y += 8;

        // Products Table Header
        doc.setFillColor(0, 177, 6);
        doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('S.No', 18, y);
        doc.text('Item Description', 30, y);
        doc.text('Qty', 105, y);
        doc.text('Rate', 118, y);
        doc.text('GST %', 138, y);
        doc.text('GST Amt', 155, y);
        doc.text('Total', 178, y);
        y += 7;

        // Reset text color
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');

        let subtotal = 0;
        let totalGST = 0;

        // Products
        if (order.products && order.products.length > 0) {
            order.products.forEach((prod, index) => {
                if (y > 255) {
                    doc.addPage();
                    y = 20;
                }
                const name = prod.name || `Product ID: ${prod.product_id}`;
                const qty = prod.quantity || 1;
                const price = prod.price || 0;
                const itemTotal = price * qty;
                const basePrice = itemTotal / (1 + GST_RATE / 100);
                const gstAmount = itemTotal - basePrice;

                subtotal += basePrice;
                totalGST += gstAmount;

                doc.setFontSize(8);
                doc.text(String(index + 1), 20, y);
                doc.text(name.substring(0, 35), 30, y);
                doc.text(String(qty), 108, y);
                doc.text(`${basePrice.toFixed(2)}`, 115, y);
                doc.text(`${GST_RATE}%`, 141, y);
                doc.text(`${gstAmount.toFixed(2)}`, 155, y);
                doc.text(`${itemTotal.toFixed(2)}`, 176, y);
                y += 6;

                // Draw line
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.2);
                doc.line(15, y - 2, pageWidth - 15, y - 2);
            });
        }

        y += 5;

        // Separator
        doc.setDrawColor(0, 177, 6);
        doc.setLineWidth(0.5);
        doc.line(15, y, pageWidth - 15, y);
        y += 8;

        // GST Summary Box
        const boxX = pageWidth / 2 + 10;
        const boxWidth = pageWidth / 2 - 25;

        doc.setFillColor(248, 248, 248);
        doc.rect(boxX, y - 5, boxWidth, 40, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(boxX, y - 5, boxWidth, 40, 'S');

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text('Subtotal (excl. GST):', boxX + 3, y + 2);
        doc.text(`Rs. ${subtotal.toFixed(2)}`, boxX + boxWidth - 3, y + 2, { align: 'right' });
        y += 7;

        doc.text(`CGST (${GST_RATE / 2}%):`, boxX + 3, y + 2);
        doc.text(`Rs. ${(totalGST / 2).toFixed(2)}`, boxX + boxWidth - 3, y + 2, { align: 'right' });
        y += 7;

        doc.text(`SGST (${GST_RATE / 2}%):`, boxX + 3, y + 2);
        doc.text(`Rs. ${(totalGST / 2).toFixed(2)}`, boxX + boxWidth - 3, y + 2, { align: 'right' });
        y += 7;

        // Total GST
        doc.text(`Total GST (${GST_RATE}%):`, boxX + 3, y + 2);
        doc.text(`Rs. ${totalGST.toFixed(2)}`, boxX + boxWidth - 3, y + 2, { align: 'right' });
        y += 8;

        // Grand Total
        doc.setFillColor(0, 177, 6);
        doc.rect(boxX, y - 3, boxWidth, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Grand Total:', boxX + 3, y + 4);
        doc.text(`Rs. ${order.total.toFixed(2)}`, boxX + boxWidth - 3, y + 4, { align: 'right' });

        y += 20;

        // Amount in words (left side)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.text(`Note: GST is calculated at ${GST_RATE}% (${GST_RATE / 2}% CGST + ${GST_RATE / 2}% SGST) inclusive in product prices.`, 15, y);

        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, 278, { align: 'center' });
        doc.text('Thank you for shopping with Grocery Store!', pageWidth / 2, 283, { align: 'center' });

        // Border around the page
        doc.setDrawColor(0, 177, 6);
        doc.setLineWidth(0.3);
        doc.rect(5, 5, pageWidth - 10, 287);

        doc.save(`Invoice_${order.order_id}.pdf`);
    };

    const handleSendEmail = async () => {
        if (!order || emailSending) return;

        setEmailSending(true);
        setEmailError('');

        try {
            await sendReceiptEmail(order.order_id);
            setEmailSent(true);
        } catch (error) {
            setEmailError(error.response?.data?.message || 'Failed to send email');
        } finally {
            setEmailSending(false);
        }
    };

    if (loading) return <Loading text={'Processing Order...'} />

    if (!order) return <div className={styles['wrapper']}><h1>Order not found</h1></div>

    return (
        <div className={styles['wrapper']} style={{ textAlign: 'center' }}>
            <div className={'heading-wrapper'}>
                <h1 className={'heading'} style={{ color: 'green' }}>🎉 Your order has been placed successfully!</h1>
            </div>

            <div className={styles['order-details']} style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                <h3>Order ID: {order.order_id}</h3>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Estimated Delivery:</strong> {new Date(new Date().setDate(new Date().getDate() + 5)).toDateString()}</p>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '10px' }}>📦 Shipment Tracking</h4>
                    <p style={{ marginBottom: '10px' }}>Use your <strong>Order ID</strong> ({order.order_id}) to track your shipment:</p>
                    <button className={'btn1'} onClick={() => navigate(`/shipping/${order.order_id}`)} style={{ marginTop: '10px' }}>
                        Track Shipment
                    </button>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4>Shipment Details</h4>
                    <p><strong>Delivery Address:</strong></p>
                    <p>{order.name.first} {order.name.last}</p>
                    <p>{order.address.street}, {order.address.area}</p>
                    <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                    <p>Phone: {order.phone_number}</p>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4>Products</h4>
                    {order.products.map((prod, index) => (
                        <div key={index} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                            <p>{prod.name ? prod.name : `Product ID: ${prod.product_id}`} x {prod.quantity}</p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4>Total Amount: {order.total} ₹</h4>
                    <p>Payment Method: {order.payment_method}</p>
                </div>

                {/* Receipt Actions */}
                <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                    <h4 style={{ marginBottom: '12px' }}>🧾 Receipt</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            className={'btn1'}
                            onClick={handleDownloadReceipt}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            📥 Download Invoice (PDF)
                        </button>
                        <button
                            className={'btn2'}
                            onClick={handleSendEmail}
                            disabled={emailSending || emailSent}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            {emailSending ? '⏳ Sending...' : emailSent ? '✅ Email Sent!' : '📧 Send Receipt to Email'}
                        </button>
                    </div>
                    {emailSent && (
                        <p style={{ marginTop: '8px', color: 'green', fontSize: '14px' }}>
                            ✅ Receipt has been sent to {order.email}
                        </p>
                    )}
                    {emailError && (
                        <p style={{ marginTop: '8px', color: 'red', fontSize: '14px' }}>
                            ❌ {emailError}
                        </p>
                    )}
                </div>

                <button className={'btn1'} onClick={() => navigate('/products')} style={{ marginTop: '30px' }}>
                    Continue Shopping
                </button>
                <button className={'btn2'} onClick={() => navigate('/orders')} style={{ marginTop: '10px', marginLeft: '10px' }}>
                    View Order History
                </button>
            </div>
        </div>
    )
}

export default Success;
