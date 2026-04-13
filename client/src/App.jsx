import { BrowserRouter, Routes, Route } from "react-router-dom";

import * as cartActions from "./actions/cart";
import Home from "./pages/home/Home";
import './shared/css/master.css';
import Navigation from "./components/navigation/Navigation";
import Footer from "./components/footer/Footer";
import CartPage from "./pages/cart/Cart";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Order from "./pages/order/Order";
import ForgotPassword from "./pages/authentication/forgot-password/ForgotPassword";
import ResetPassword from "./pages/authentication/forgot-password/ResetPassword";
import Signup from "./pages/authentication/signup/Signup";
import Shipment from "./pages/shipment/Shipment";
import Login from "./pages/authentication/login/Login";
import PrivateRoute from "./components/privete-route/PrivateRoute";
import Wishlist from "./pages/wishlist/Wishlist";
import Error401 from "./pages/errors/401/Error401";
import Error404 from "./pages/errors/404/Error404";
import Admin from "./pages/admin/default/Admin";
import AdminUpdate from "./pages/admin/products/update/default/AdminUpdate";
import AdminUpdateSuccess from "./pages/admin/products/update/success/AdminUpdateSuccess";
import AdminUpdateOrder from "./pages/admin/orders/update/AdminUpdateOrder";
import AdminNewOrder from "./pages/admin/orders/new/AdminNewOrder";
import ScrollToTop from "./components/scroll-to-top/ScrollToTop";
import AdminOrders from "./pages/admin/orders/default/AdminOrders";
import AdminViewOrder from "./pages/admin/orders/id/AdminViewOrder";
import AdminNewProduct from "./pages/admin/products/new/AdminNewProduct";
import AdminShipping from "./pages/admin/shipment/default/AdminShipping";
import AdminUpdateShipping from "./pages/admin/shipment/update/AdminUpdateShipping";
import Products from './pages/products/Products';

import Checkout from "./pages/checkout/checkout";
import Success from "./pages/checkout/success";
import ShipmentId from "./pages/shipment/id/ShipmentId";
import OrderId from "./pages/order/id/OrderId";
import Invoice from "./components/invoice/Invoice";
import Contact from "./pages/contact/Contact";

const App = () => {
    const dispatch = useDispatch();
    const cart = useSelector(state => state.cart.cart) || [];
    const [user] = useState(JSON.parse(localStorage.getItem('profile')));

    useEffect(() => {
        const syncCart = async () => {
            if (user?.token) {
                await dispatch(cartActions.getCartAsync());
            } else {
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                dispatch(cartActions.setCart(localCart));
            }
        }
        syncCart();
    }, [user, dispatch]);

    const addProductToCart = async (product) => {
        const productId = product.product_id || product.id;
        const qty = product.quantity || 1;
        
        if (product.remove) {
            if (user?.token) {
                await dispatch(cartActions.removeFromCartAsync(productId));
            } else {
                const newCart = cart.filter((cartItem) => cartItem.product_id !== productId);
                dispatch(cartActions.setCart(newCart));
                localStorage.setItem('cart', JSON.stringify(newCart));
            }
            return;
        }

        if (qty < 0) {
            const productInCart = cart.find(p => p.product_id === productId);
            if (!productInCart) return;
            
            if (productInCart.quantity + qty <= 0) {
                if (user?.token) {
                    await dispatch(cartActions.removeFromCartAsync(productId));
                } else {
                    const newCart = cart.filter((cartItem) => cartItem.product_id !== productId);
                    dispatch(cartActions.setCart(newCart));
                    localStorage.setItem('cart', JSON.stringify(newCart));
                }
            } else {
                if (user?.token) {
                    await dispatch(cartActions.updateCartItemAsync(productId, productInCart.quantity + qty));
                } else {
                    const newCart = cart.map(item => 
                        item.product_id === productId 
                            ? { ...item, quantity: item.quantity + qty }
                            : item
                    );
                    dispatch(cartActions.setCart(newCart));
                    localStorage.setItem('cart', JSON.stringify(newCart));
                }
            }
            return;
        }

        if (user?.token) {
            await dispatch(cartActions.addToCartAsync(productId, qty));
        } else {
            const productIndex = cart.findIndex((cartProduct) => cartProduct.product_id === productId);
            let newCart;
            if (productIndex >= 0) {
                const updatedData = { ...cart[productIndex], quantity: cart[productIndex].quantity + qty };
                const newArray = [...cart];
                newArray[productIndex] = updatedData;
                newCart = newArray;
            } else {
                newCart = [...cart, { ...product, product_id: productId, quantity: qty }];
            }
            dispatch(cartActions.setCart(newCart));
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    }

    const removeProductFromCart = async (product) => {
        const productId = product.product_id || product.id;
        if (user?.token) {
            const productInCart = cart.find(p => p.product_id === productId);
            if (productInCart && productInCart.quantity > 1) {
                await dispatch(cartActions.updateCartItemAsync(productId, productInCart.quantity - 1));
            } else {
                await dispatch(cartActions.removeFromCartAsync(productId));
            }
        } else {
            const productIndex = cart.findIndex((cartProduct) => cartProduct.product_id === productId);

            if (productIndex === -1) return;

            let newCart;
            if (cart[productIndex].quantity === 1) {
                newCart = cart.filter((cartItem) => cartItem.product_id !== productId);
            } else {
                const updatedData = { ...cart[productIndex], quantity: cart[productIndex].quantity - 1 };
                const newArray = [...cart];
                newArray[productIndex] = updatedData;
                newCart = newArray;
            }
            dispatch(cartActions.setCart(newCart));
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    }

    const updateQuantity = (product, operation) => {
        if (operation === 'ADD')
            return addProductToCart(product);

        if (operation === 'REMOVE')
            return removeProductFromCart(product)
    }

    const cartCount = useMemo(() => {
        return cart.reduce((total, cartElement) => total + cartElement.quantity, 0);
    }, [cart]);

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Navigation cartCount={cartCount} />
            <Routes>
                <Route path={'/'} element={<Home />} />
                <Route path={'/products'} element={<Products addProductToCart={addProductToCart} />} />
                <Route path={'/cart'}
                    element={<CartPage cartCount={cartCount} updateQuantity={updateQuantity} />} />
                <Route path={'/checkout'} element={<PrivateRoute component={<Checkout />} />} />
                <Route path={'/checkout/success'} element={<Success />} />
                <Route path={'/signup'} element={<Signup />} />
                <Route path={'/contact'} element={<Contact />} />
                <Route path={'/shipping'} element={<Shipment />} />
                <Route path={'/shipping/:id'} element={<ShipmentId />} />
                <Route path={'/login'} element={<Login />} />
                <Route path={'/forgot-password'} element={<ForgotPassword />} />
                <Route path={'/reset-password'} element={<ResetPassword />} />
                <Route path={'/orders'} element={<Order />} />
                <Route path={'/orders/:id'} element={<OrderId />} />
                <Route path={'/orders/:id/invoice'} element={<Invoice />} />
                <Route path={'/wishlist'} element={<PrivateRoute component={<Wishlist addProductToCart={addProductToCart} />} />} />
                <Route path={'/admin'} element={<PrivateRoute role={'ADMIN'} component={<Admin />} />} />
                <Route path={'/admin/orders'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminOrders />} />} />
                <Route path={'/admin/orders/update'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminUpdateOrder />} />} />
                <Route path={'/admin/orders/new'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminNewOrder />} />} />
                <Route path={'/admin/shipping'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminShipping />} />} />
                <Route path={'/admin/shipping/update'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminUpdateShipping />} />} />
                <Route path={'/admin/products/new'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminNewProduct />} />} />
                <Route path={'/admin/products/update'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminUpdate />} />} />
                <Route path={'/admin/products/update/success'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminUpdateSuccess />} />} />
                <Route path={'/admin/orders/:id'}
                    element={<PrivateRoute role={'ADMIN'} component={<AdminViewOrder />} />} />
                <Route path={'/401'} element={<Error401 />} />
                <Route path={'/*'} element={<Error404 />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;