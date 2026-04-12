import styles from './adminNewOrder.module.css';
import {useState} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import Loading from "../../../../components/loading/Loading";
import SuccessImage from '../../../../shared/assets/state/success.png';
import {createOrderAdmin} from "../../../../actions/admin";

const AdminNewOrder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [createdOrderId, setCreatedOrderId] = useState("");

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        address: JSON.stringify({ country: "India", state: "", city: "", pincode: "", area: "", street: "" }, null, 2),
        products: JSON.stringify([{ product_id: "", quantity: 1, price: 0 }], null, 2),
        total: "",
        paymentMethod: "CASH"
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProductChange = (index, field, value) => {
        const products = JSON.parse(formData.products);
        products[index] = { ...products[index], [field]: value };
        setFormData({ ...formData, products: JSON.stringify(products, null, 2) });
    };

    const addProduct = () => {
        const products = JSON.parse(formData.products);
        products.push({ product_id: "", quantity: 1, price: 0 });
        setFormData({ ...formData, products: JSON.stringify(products, null, 2) });
    };

    const removeProduct = (index) => {
        const products = JSON.parse(formData.products);
        products.splice(index, 1);
        setFormData({ ...formData, products: JSON.stringify(products, null, 2) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError("");

        const onSuccess = (data) => {
            setLoading(false);
            setSuccess(true);
            setCreatedOrderId(data.order_id);
        };

        const onError = (err) => {
            setLoading(false);
            setError(err.message || "Failed to create order");
        };

        dispatch(createOrderAdmin(formData, onSuccess, onError));
    };

    const handleReset = () => {
        setSuccess(false);
        setCreatedOrderId("");
        setError("");
        setFormData({
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            address: JSON.stringify({ country: "India", state: "", city: "", pincode: "", area: "", street: "" }, null, 2),
            products: JSON.stringify([{ product_id: "", quantity: 1, price: 0 }], null, 2),
            total: "",
            paymentMethod: "CASH"
        });
    };

    if (success) {
        return (
            <div className={styles['wrapper']}>
                <div className={styles['success-wrapper']}>
                    <img src={SuccessImage} alt="Success" />
                    <h2>Order Created Successfully!</h2>
                    <p>Order ID: <strong>{createdOrderId}</strong></p>
                    <p>This 6-digit ID can be used for shipment tracking.</p>
                    <div className={styles['btn-group']}>
                        <div className={'btn1'} onClick={() => navigate('/admin/orders')}>View All Orders</div>
                        <div className={'btn2'} onClick={handleReset}>Create Another</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['wrapper']}>
            {loading && <Loading text="Creating Order..." overlay={true} />}
            
            <div className={'heading'}>
                <h1>Create New Order</h1>
            </div>

            <div className={styles['info-box']}>
                <strong>Note:</strong> Orders created here will generate a 6-digit ID that customers can use for shipment tracking.
            </div>

            {error && <div className={'error-box'}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles['form']}>
                <div className={styles['section']}>
                    <h3>Customer Details</h3>
                    <div className={styles['field']}>
                        <label>Customer Name *</label>
                        <input type="text" name="customerName" value={formData.customerName} 
                            onChange={handleChange} placeholder="John Doe" required />
                    </div>
                    <div className={styles['field']}>
                        <label>Email</label>
                        <input type="email" name="customerEmail" value={formData.customerEmail} 
                            onChange={handleChange} placeholder="john@example.com" />
                    </div>
                    <div className={styles['field']}>
                        <label>Phone</label>
                        <input type="text" name="customerPhone" value={formData.customerPhone} 
                            onChange={handleChange} placeholder="+91 9876543210" />
                    </div>
                </div>

                <div className={styles['section']}>
                    <h3>Address (JSON format)</h3>
                    <div className={styles['field']}>
                        <textarea name="address" value={formData.address} 
                            onChange={handleChange} rows={6} 
                            placeholder='{"country": "India", "state": "", "city": "", "pincode": "", "area": "", "street": ""}' />
                    </div>
                </div>

                <div className={styles['section']}>
                    <h3>Products</h3>
                    <div className={styles['products-list']}>
                        {JSON.parse(formData.products).map((product, index) => (
                            <div key={index} className={styles['product-row']}>
                                <input type="text" placeholder="Product ID" 
                                    value={product.product_id}
                                    onChange={(e) => handleProductChange(index, 'product_id', e.target.value)} />
                                <input type="number" placeholder="Qty" min="1"
                                    value={product.quantity}
                                    onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))} />
                                <input type="number" placeholder="Price" min="0" step="0.01"
                                    value={product.price}
                                    onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))} />
                                {JSON.parse(formData.products).length > 1 && (
                                    <button type="button" className={styles['remove-btn']} 
                                        onClick={() => removeProduct(index)}>✕</button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" className={styles['add-btn']} onClick={addProduct}>+ Add Product</button>
                </div>

                <div className={styles['section']}>
                    <h3>Order Details</h3>
                    <div className={styles['field']}>
                        <label>Total Amount (₹) *</label>
                        <input type="number" name="total" value={formData.total} 
                            onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
                    </div>
                    <div className={styles['field']}>
                        <label>Payment Method</label>
                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                            <option value="CASH">Cash on Delivery</option>
                            <option value="ONLINE">Online Payment</option>
                        </select>
                    </div>
                </div>

                <div className={styles['actions']}>
                    <button type="button" className={'btn2'} onClick={() => navigate('/admin/orders')}>Cancel</button>
                    <button type="submit" className={'btn1'} style={{ opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Creating...' : 'Create Order'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminNewOrder;
