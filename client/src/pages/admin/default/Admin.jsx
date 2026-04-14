import styles from './admin.module.css';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../../actions/admin";
import Loading from "../../../components/loading/Loading";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

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
    const monthlySales = adminData?.monthlySales || [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = new Array(12).fill(0);
    monthlySales.forEach(item => {
        const monthIndex = item._id.month - 1;
        salesData[monthIndex] = item.totalSales;
    });

    const chartData = {
        labels: monthNames,
        datasets: [
            {
                label: 'Monthly Sales (₹)',
                data: salesData,
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(162, 28, 175, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(248, 113, 113, 0.8)',
                    'rgba(52, 211, 153, 0.8)',
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(249, 115, 22)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(20, 184, 166)',
                    'rgb(234, 179, 8)',
                    'rgb(162, 28, 175)',
                    'rgb(14, 165, 233)',
                    'rgb(99, 102, 241)',
                    'rgb(248, 113, 113)',
                    'rgb(52, 211, 153)',
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: 'Monthly Sales (Last 12 Months)',
                font: { size: 16, weight: 'bold' },
                padding: { bottom: 20 }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => `Sales: ₹${context.raw?.toLocaleString() || 0}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                title: {
                    display: true,
                    text: 'Sales (₹)',
                    font: { weight: 'bold' }
                },
                ticks: {
                    callback: (value) => '₹' + value.toLocaleString()
                }
            },
            x: {
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Month',
                    font: { weight: 'bold' }
                }
            }
        }
    };

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
                                <button onClick={handleLogin} className={styles['btn-primary']} aria-label="Login as Admin">
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
                                <button onClick={handleRetry} className={styles['btn-secondary']} aria-label="Try Again">
                                    Try Again
                                </button>
                                <Link to="/" className={styles['btn-link']} aria-label="Go to Home">
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
                                <button onClick={handleRetry} className={styles['btn-primary']} aria-label="Retry">
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
                    <div className={'heading'}>
                        <h2>Dashboard Overview</h2>
                    </div>
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

                    {/* Sales Chart */}
                    {monthlySales.length > 0 && (
                        <div className={styles['chart-section']}>
                            <div className={'heading'}>
                                <h2>Sales Overview</h2>
                            </div>
                            <div className={styles['chart-container']}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className={'heading'}>
                        <h2>Quick Actions</h2>
                    </div>
                    <div className={styles['actions']}>
                        <Link to={'/admin/products/new'} className={styles['action']} aria-label="Add new product">Add New Product</Link>
                        <Link to={'/admin/products/update'} className={styles['action']} aria-label="Update products">Update Products</Link>
                        <Link to={'/admin/orders'} className={styles['action']} aria-label="Track orders">Track Orders</Link>
                        <Link to={'/admin/orders/new'} className={styles['action']} aria-label="Create new order">Create New Order</Link>
                        <Link to={'/admin/orders/update'} className={styles['action']} aria-label="Update order status">Update Order Status</Link>
                        <Link to={'/admin/shipping'} className={styles['action']} aria-label="Track shipping">Track Shipping</Link>
                        <Link to={'/admin/shipping/update'} className={styles['action']} aria-label="Update shipping status">Update Shipping Status</Link>
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
                                        <Link to={`/admin/products/update`} className={styles['alert-link']} aria-label={`Update stock for ${product.name}`}>
                                            Update
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )
            }
        </div >
    );
}

export default Admin;
