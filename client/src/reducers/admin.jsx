import { DASHBOARD_STATS } from "../constants/actions/admin";

const initialState = {
    stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalShipments: 0,
        totalUsers: 0,
        totalRevenue: '0.00'
    },
    recentOrders: [],
    lowStockProducts: [],
    ordersByStatus: [],
    users: [],
    product: null,
    error: null
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case DASHBOARD_STATS:
            return { 
                ...state, 
                stats: action.data.stats,
                recentOrders: action.data.recentOrders,
                lowStockProducts: action.data.lowStockProducts,
                ordersByStatus: action.data.ordersByStatus
            };
        case 'ADMIN_USERS':
            return { ...state, users: action.data };
        case 'ADMIN_PRODUCT':
            return { ...state, product: action.data };
        case 'ADMIN_ERROR':
            return { ...state, error: action.data };
        default:
            return state;
    }
};

export default adminReducer;
