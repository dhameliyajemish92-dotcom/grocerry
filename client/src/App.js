import { BrowserRouter, Routes, Route } from "react-router-dom";

import * as cartActions from "./actions/cart"; // Import cart actions for error handling
import Home from "./pages/home/Home";
import './shared/css/master.css';
import Navigation from "./components/navigation/Navigation";
import Footer from "./components/footer/Footer";
import CartPage from "./pages/cart/Cart";
import { useEffect, useState } from "react";
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

    const [cart, setCart] = useState([]); // Initialize empty, will sync
    const [user] = useState(JSON.parse(localStorage.getItem('profile')));

    useEffect(() => {
        const syncCart = async () => {
            if (user?.token) {
                // Use action wrapper to handle 401s
                const backendCart = await cartActions.getCart();
                setCart(backendCart || []);
            } else {
                localStorage.removeItem('cart'); // Clear stale data
                setCart([]);
            }
        }
        syncCart();
    }, [user]);

    const addProductToCart = async (product) => {
        const productId = product.product_id || product.id;
        if (user?.token) {
            // Use action wrapper
            const updatedCart = await cartActions.addToCart(productId, 1);
            if (updatedCart) setCart(updatedCart);
        } else {
            const productIndex = cart.findIndex((cartProduct) => cartProduct.product_id === productId);
            let newCart;
            if (productIndex >= 0) {
                const updatedData = { ...cart[productIndex], quantity: cart[productIndex].quantity + 1 };
                const newArray = [...cart];
                newArray[productIndex] = updatedData;
                newCart = newArray;
            } else {
                // Ensure we store product_id in the local cart item
                newCart = [...cart, { ...product, product_id: productId, quantity: 1 }];
            }
            setCart(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    }

    const removeProductFromCart = async (product) => {
        const productId = product.product_id || product.id;
        if (user?.token) {
            // Logic for remove/decrement needs to be handled.
            // My backend /cart delete removes the item entirely.
            // My backend /cart patch updates quantity.
            const productInCart = cart.find(p => p.product_id === productId);
            if (productInCart && productInCart.quantity > 1) {
                const updatedCart = await cartActions.updateCartItem(productId, productInCart.quantity - 1);
                if (updatedCart) setCart(updatedCart);
            } else {
                const updatedCart = await cartActions.removeFromCart(productId);
                if (updatedCart) setCart(updatedCart);
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
            setCart(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    }

    const updateQuantity = (product, operation) => {
        if (operation === 'ADD')
            return addProductToCart(product);

        if (operation === 'REMOVE')
            return removeProductFromCart(product)
    }

    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        let products = 0;
        for (const cartElement of cart) {
            products += cartElement.quantity;
        }

        setCartCount(products);
    }, [cart])

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Navigation cartCount={cartCount} />
            <Routes>
                <Route path={'/'} element={<Home addProductToCart={addProductToCart} />} />
                <Route path={'/products'} element={<Products addProductToCart={addProductToCart} />} />
                <Route path={'/cart'}
                    element={<CartPage cart={cart} cartCount={cartCount} updateQuantity={updateQuantity} />} />
                <Route path={'/checkout'} element={<PrivateRoute component={<Checkout />} />} />
                <Route path={'/checkout/success'} element={<Success setCart={setCart} />} />
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