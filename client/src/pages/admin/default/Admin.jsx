import styles from './admin.module.css';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../../actions/admin";
import Loading from "../../../components/loading/Loading";

const Admin = () => {
    const adminData = useSelector(state => state.admin);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Clear any previous errors
        setError(null);

        dispatch(fetchDashboardStats(
            (data) => {
                setLoading(false);
            },
            (err) => {
                setLoading(false);
                console.error("Admin Dashboard Error:", err);

                // Handle authentication/authorization errors
                if (err.code === 'NO_TOKEN' || err.code === 'TOKEN_EXPIRED' || err.code === 'INVALID_TOKEN') {
                    setError({
                        type: 'auth',
                        message: err.message || 'Your session has expired. Please login again.',
                        code: err.code
                    });
                } else if (err.code === 'NOT_ADMIN' || err.code === 'NO_ROLE') {
                    setError({
                        type: 'access',
                        message: err.message || 'You do not have admin privileges to access this page.',
                        code: err.code,
                        currentRole: err.currentRole
                    });
                } else {
                    setError({
                        type: 'general',
                        message: err.message || 'Failed to load dashboard statistics.',
                        code: err.code
                    });
                }
            }
        ));
    }, [dispatch]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        dispatch(fetchDashboardStats(
            () => setLoading(false),
            (err) => {
                setLoading(false);
                setError({ type: 'general', message: err.message, code: err.code });
            }
        ));
    };

    const handleLogin = () => {
        navigate('/login?redirect=/admin');
    };

    const stats = adminData?.stats || {};
    const recentOrders = adminData?.recentOrders || [];
    const lowStockProducts = adminData?.lowStockProducts || [];

    // Render error state
    if (error) {
        return (
            <div className={styles['wrapper']}>
                <div className={'heading'}>
                    <h1>Admin Panel</h1>
                </div>

                <div className={styles['error-container']}>
                    {error.type === 'auth' && (
                        <div className={styles['error-box']}>
                            <div className={styles['error-icon']}>🔐</div>
                            <h3>Authentication Required</h3>
                            <p>{error.message}</p>
                            <div className={styles['error-actions']}>
                                <button onClick={handleLogin} className={styles['btn-primary']}>
                                    Login as Admin
                                </button>
                            </div>
                        </div>
                    )}

                    {error.type === 'access' && (
                        <div className={styles['error-box']}>
                            <div className={styles['error-icon']}>🚫</div>
                            <h3>Access Denied</h3>
                            <p>{error.message}</p>
                            {error.currentRole && (
                                <p className={styles['error-detail']}>
                                    Your current role: <strong>{error.currentRole}</strong>
                                </p>
                            )}
                            <div className={styles['error-actions']}>
                                <button onClick={handleRetry} className={styles['btn-secondary']}>
                                    Try Again
                                </button>
                                <Link to="/" className={styles['btn-link']}>
                                    Go to Home
                                </Link>
                            </div>
                        </div>
                    )}

                    {error.type === 'general' && (
                        <div className={styles['warning-box']}>
                            <div className={styles['error-icon']}>⚠️</div>
                            <h3>Unable to Load Dashboard</h3>
                            <p>{error.message}</p>
                            <div className={styles['error-actions']}>
                                <button onClick={handleRetry} className={styles['btn-primary']}>
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles['wrapper']}>
            <div className={'heading'}>
                <h1>Admin Panel</h1>
            </div>

            {loading ? <Loading /> : (
                <>
                    {/* Stats Section */}
                    <div className={styles['stats-grid']}>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-value']}>{stats.totalProducts || 0}</div>
                            <div className={styles['stat-label']}>Total Products</div>
                        </div>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-value']}>{stats.totalOrders || 0}</div>
                            <div className={styles['stat-label']}>Total Orders</div>
                        </div>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-value']}>{stats.totalUsers || 0}</div>
                            <div className={styles['stat-label']}>Total Users</div>
                        </div>
                        <div className={styles['stat-card']}>
                            <div className={styles['stat-value']}>₹{stats.totalRevenue || '0.00'}</div>
                            <div className={styles['stat-label']}>Total Revenue</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={'heading'}>
                        <h2>Quick Actions</h2>
                    </div>
                    <div className={styles['actions']}>
                        <Link to={'/admin/products/new'} className={styles['action']}>Add New Product</Link>
                        <Link to={'/admin/products/update'} className={styles['action']}>Update Products</Link>
                        <Link to={'/admin/orders'} className={styles['action']}>Track Orders</Link>
                        <Link to={'/admin/orders/new'} className={styles['action']}>Create New Order</Link>
                        <Link to={'/admin/orders/update'} className={styles['action']}>Update Order Status</Link>
                        <Link to={'/admin/shipping'} className={styles['action']}>Track Shipping</Link>
                        <Link to={'/admin/shipping/update'} className={styles['action']}>Update Shipping Status</Link>
                    </div>

                    {/* Recent Orders */}
                    {recentOrders.length > 0 && (
                        <div className={styles['section']}>
                            <div className={'heading'}>
                                <h2>Recent Orders</h2>
                            </div>
                            <div className={styles['table-container']}>
                                <table className={styles['table']}>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.order_id}>
                                                <td>{order.order_id}</td>
                                                <td>₹{parseFloat(order.total || 0).toFixed(2)}</td>
                                                <td>
                                                    <span className={`${styles['status-badge']} ${styles[order.status?.toLowerCase()]}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.ordered_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Low Stock Products */}
                    {lowStockProducts.length > 0 && (
                        <div className={styles['section']}>
                            <div className={'heading'}>
                                <h2>Low Stock Alerts</h2>
                            </div>
                            <div className={styles['alerts']}>
                                {lowStockProducts.map((product) => (
                                    <div key={product.id} className={styles['alert-card']}>
                                        <div className={styles['alert-content']}>
                                            <span className={styles['alert-name']}>{product.name}</span>
                                            <span className={styles['alert-stock']}>Stock: {product.stock}</span>
                                        </div>
                                        <Link to={`/admin/products/update`} className={styles['alert-link']}>
                                            Update
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Admin;
