import {ORDERS_FETCH, ORDERS_FETCH_ALL} from "../constants/actions/orders";

const initialOrders = {
    all: { orders: [], total_pages: 1 },
    fetched: null
}

const reducer = (state = initialOrders, action) => {
    switch (action.type) {
        case ORDERS_FETCH:
            return {...state, fetched: action.data}
        case ORDERS_FETCH_ALL:
            return {...state, all: action.data}
        default:
            return state;
    }
}

export default reducer;