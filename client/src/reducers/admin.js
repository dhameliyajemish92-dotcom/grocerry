import { DASHBOARD_STATS } from "../constants/actions/admin";

const initialState = {
    stats: null,
    users: [],
    product: null,
    error: null
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case DASHBOARD_STATS:
            return { ...state, stats: action.data };
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
