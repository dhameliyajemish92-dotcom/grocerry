import styles from './admin.module.css';
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchDashboardStats} from "../../../actions/admin";
import Loading from "../../../components/loading/Loading";

const Admin = () => {
    const adminData = useSelector(state => state.admin);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dispatch(fetchDashboardStats(
            () => setLoading(false),
            () => setLoading(false)
        ));
    }, [dispatch]);

    const stats = adminData?.stats || {};
    const recentOrders = adminData?.recentOrders || [];
    const lowStockProducts = adminData?.lowStockProducts || [];

    return (
        <div className={styles['wrapper']}>
            <div className={'heading'}>
                <h1>Admin Panel</h1>
            </div>

            {loading ? <Loading/> : (
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
                            <div className={styles['stat-value']}>${stats.totalRevenue || '0.00'}</div>
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
                                            <td>${order.total}</td>
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
                                        <Link to={`/admin/products/update/${product.id}`} className={styles['alert-link']}>
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
