import Order from "../../model/Orders.js";
import Pagination from "../../utils/pagination.js";
import axios from "axios";
import { USER_BASEURL, PRODUCTS_BASEURL, NOTIFICATIONS_BASEURL, SHIPPING_BASEURL } from "../../services/BaseURLs.js";

export const createOrder = async (req, res) => {
    try {
        const { data, payment_method } = req.body;
        const userId = req.user.id; // From auth middleware

        const order = new Order({
            order_id: data.order_id,
            user_id: userId,
            name: {
                first: data.firstName,
                last: data.lastName,
            },
            email: data.email,
            phone_number: data.phone_number,
            address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address,
            ordered_at: Date.now(),
            products: typeof data.products === 'string' ? JSON.parse(data.products) : data.products,
            total: data.total,
            payment_method: payment_method || 'COD', // Default or from body
            payment_status: 'PENDING',
            status: 'CONFIRMED'
        });

        await order.save();

        await axios.patch(
            `${PRODUCTS_BASEURL}/updateQuantity`,
            { products: order.products }
        );

        const to = order.email;

        // Try catch for notifications/shipping to not block order creation response
        try {
            await axios.post(
                `${NOTIFICATIONS_BASEURL}/order-confirmation`,
                { to, order }
            );

            await axios.post(`${SHIPPING_BASEURL}`, {
                ordered_at: order.ordered_at,
                order_id: order.order_id,
                address: order.address,
                total: order.total,
            });
        } catch (subError) {
            console.log("Sub-service error:", subError.message);
        }

        res.status(200).json({ order_id: order.order_id });
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: error.message });
    }
};

import jwt from "jsonwebtoken";
import generateId from "../../utils/generateId.js";

export const createOrderCOD = async (req, res) => {
    try {
        const { token, data } = req.body;
        const userId = req.user.id; // From auth

        // Verify cart token to get trusted products and total
        const { products, total } = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );

        const order_id = generateId();

        const order = new Order({
            order_id: order_id,
            user_id: userId,
            name: {
                first: data.name.first,
                last: data.name.last,
            },
            email: data.email,
            phone_number: data.phone_number,
            address: data.address,
            ordered_at: Date.now(),
            products: products,
            total: total,
            status: 'CONFIRMED', // Default status
            payment_method: 'COD',
            payment_status: 'PENDING'
        });

        await order.save();

        // Update inventory
        await axios.patch(
            `${PRODUCTS_BASEURL}/updateQuantity`,
            { products: order.products }
        );

        // Send Notification
        try {
            await axios.post(
                `${NOTIFICATIONS_BASEURL}/order-confirmation`,
                { to: data.email, order }
            );
        } catch (e) {
            console.log("Notification failed", e.message);
        }

        // Create Shipment
        await axios.post(`${SHIPPING_BASEURL}`, {
            ordered_at: order.ordered_at,
            order_id: order.order_id,
            address: order.address,
            total: order.total,
        });

        res.status(200).json({ order_id: order.order_id });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};


export const getOrder = async (req, res) => {
    try {
        const requiredOrder = await Order.findOne({ order_id: req.params.id });

        if (!requiredOrder) {
            return res.status(404).json({ message: "Order does not exist" });
        }

        const productIds = requiredOrder.products.map(pr => pr.product_id);
        const { data } = await axios.post(`${PRODUCTS_BASEURL}/arr`, { arr: productIds });

        res.status(200).json({ ...requiredOrder._doc, products: data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const getAllOrders = async (req, res) => {
    try {

        const id = req.body.id;

        // verify the user's role by calling the `User` service
        try {
            await axios.post(`${USER_BASEURL}/role`, { id, role: 'ADMIN' })
        } catch (e) {
            const { response } = e;
            return res.status(response.status).json(response.data);
        }

        const orders = await Order.find().sort({ ordered_at: -1 });
        const ordersPaged = Pagination(req.query.page, orders);

        const total_pages = Math.ceil((await Order.count()) / 20);

        res.status(200).json({ total_pages, orders: ordersPaged });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateOrder = async (req, res) => {
    try {

        const orderStatus = req.body.status;
        const id = req.body.id;

        // verify the user's role by calling the `User` service
        try {
            await axios.post(`${USER_BASEURL}/role`, { id, role: 'ADMIN' })
        } catch (e) {
            const { response } = e;
            return res.status(response.status).json(response.data);
        }

        if (!['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(orderStatus)) {
            return res.status(400).json({ message: "Invalid status, has to be CONFIRMED, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED" });
        }

        const updatedOrder = await Order.findOneAndUpdate({ "order_id": req.params.id }, {
            status: orderStatus,
        });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order does not exist" });
        }

        res.status(200).json(updatedOrder);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ user_id: userId }).sort({ ordered_at: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
