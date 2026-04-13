const initialState = {
    cart: [],
    loading: false,
    error: null
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_CART':
            return { ...state, cart: action.data, loading: false };
        case 'ADD_TO_CART':
            const existingIndex = state.cart.findIndex(
                item => (item.product_id || item.id) === (action.data.product_id || action.data.id)
            );
            if (existingIndex >= 0) {
                const newCart = [...state.cart];
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: newCart[existingIndex].quantity + action.data.quantity
                };
                return { ...state, cart: newCart };
            }
            return { ...state, cart: [...state.cart, action.data] };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cart: state.cart.filter(
                    item => (item.product_id || item.id) !== action.data
                )
            };
        case 'UPDATE_CART_QUANTITY':
            return {
                ...state,
                cart: state.cart.map(item =>
                    (item.product_id || item.id) === action.data.product_id
                        ? { ...item, quantity: action.data.quantity }
                        : item
                )
            };
        case 'CLEAR_CART':
            return { ...state, cart: [] };
        default:
            return state;
    }
};

export default reducer;