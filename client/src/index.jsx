import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from "react-redux";
import { configureStore } from '@reduxjs/toolkit'
import products from './reducers/products';
import authentication from "./reducers/authentication";
import orders from "./reducers/orders";
import shipping from "./reducers/shipping";
import admin from "./reducers/admin";
import cart from "./reducers/cart";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './shared/css/master.css';

const renderApp = () => {
    let rootElement = document.getElementById('root');

    if (!rootElement) {
        console.warn('Root element not found! Creating a fallback #root div.');
        rootElement = document.createElement('div');
        rootElement.id = 'root';
        document.body.appendChild(rootElement);
    }

    const root = ReactDOM.createRoot(rootElement);
    const store = configureStore({
        reducer: {
            products,
            authentication,
            orders,
            shipping,
            admin
        }
    });

    root.render(
        <React.StrictMode>
            <Provider store={store}>
                <ToastContainer position="bottom-right" autoClose={3000} />
                <App />
            </Provider>
        </React.StrictMode>
    );
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderApp);
} else {
    renderApp();
}