import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import generateId from "../../utils/generateId.js";
import { ORDERS_BASEURL, WEBSITE_BASE_URL, PRODUCTS_BASEURL } from "../../services/BaseURLs.js";

import Order from "../../model/Orders.js";
import { NOTIFICATIONS_BASEURL, SHIPPING_BASEURL } from "../../services/BaseURLs.js";

// SIMPLE FILE LOGGER FOR DEBUGGING
const logToFile = (message, data) => {
    try {
        const logPath = path.join(process.cwd(), 'payment_debug.log');
        const timestamp = new Date().toISOString();
        let dataStr = '';
        if (data) {
            if (data instanceof Error) {
                dataStr = JSON.stringify({
                    message: data.message,
                    stack: data.stack,
                    response: data.response ? data.response.data : undefined
                }, null, 2);
            } else {
                dataStr = JSON.stringify(data, null, 2);
            }
        }
        const logMessage = `[${timestamp}] ${message} ${dataStr}\n`;
        fs.appendFileSync(logPath, logMessage);
    } catch (e) {
        console.error("Failed to write to log file:", e.message);
    }
};

logToFile("Payments.js module loaded with Direct Axios Implementation");

/**
 * Step 1: Create Razorpay Order (Direct Axios)
 */
export const createCheckoutSession = async (req, res) => {
    logToFile("createCheckoutSession started", { body: req.body });
    try {
        let decodedCart;
        try {
            decodedCart = jwt.verify(
                req.body.token,
                process.env.JWT_SECRET_KEY || 'test'
            );
        } catch (jwtError) {
            logToFile("Cart verification failed", jwtError);
            return res.status(400).json({
                message: "Invalid or expired cart session. Please refresh your cart.",
            });
        }

        const { total } = decodedCart;
        const { data } = req.body;

        const order_id = generateId();
        const amount = Math.round(parseFloat(total) * 100);

        if (isNaN(amount) || amount <= 0) {
            logToFile("Invalid amount", { amount, total });
            return res.status(400).json({ message: "Invalid order amount" });
        }

        const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
        const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

        if (!key_id || !key_secret) {
            logToFile("MISSING RAZORPAY KEYS");
            return res.status(500).json({ message: "Razorpay keys are missing in .env" });
        }

        const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

        const options = {
            amount: amount,
            currency: "INR",
            receipt: order_id,
        };

        logToFile("Creating Razorpay order via Axios", { options, key_id });

        try {
            const response = await axios.post(
                "https://api.razorpay.com/v1/orders",
                options,
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const razorpayOrder = response.data;
            logToFile("Razorpay order created successfully", { id: razorpayOrder.id });

            res.status(201).json({
                order_id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: order_id,
                data: data,
                key_id: key_id
            });
        } catch (axiosError) {
            logToFile("RAZORPAY API ERROR (AXIOS)", axiosError);
            const errorMsg = axiosError.response?.data?.error?.description || axiosError.message;
            return res.status(500).json({
                message: "Razorpay API Error",
                error: errorMsg,
                details: axiosError.response?.data
            });
        }

    } catch (error) {
        logToFile("GLOBAL ERROR in createCheckoutSession", error);
        res.status(500).json({
            message: "Failed to create Razorpay order",
            error: error.message
        });
    }
};

/**
 * Step 2: Verify Payment Signature & Save Order
 */
export const verifyPayment = async (req, res) => {
    logToFile("verifyPayment started", { body: req.body });
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        metadata
    } = req.body;

    try {
        const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

        // 1. SECURE SIGNATURE VERIFICATION
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            logToFile("Signature verification failed", { expected: expectedSignature, received: razorpay_signature });
            return res.status(400).json({ message: "Payment verification failed: Invalid signature" });
        }

        logToFile("Signature verified");

        // 2. CHECK FOR DUPLICATE ORDER
        const existingOrder = await Order.findOne({ order_id: metadata.order_id });
        if (existingOrder) {
            logToFile("Duplicate order detected", { order_id: metadata.order_id });
            return res.status(200).json({ message: "Order already exists", order_id: metadata.order_id });
        }

        // 3. SAVE ORDER TO DATABASE
        const order = new Order({
            order_id: metadata.order_id,
            user_id: metadata.user_id,
            name: metadata.name,
            email: metadata.email,
            phone_number: metadata.phone_number,
            address: metadata.address,
            ordered_at: Date.now(),
            products: metadata.products,
            total: metadata.total,
            status: 'CONFIRMED',
            payment_method: 'UPI/CARD',
            payment_status: 'PAID',
            razorpay_details: {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id
            }
        });

        await order.save();
        logToFile("Order saved to DB", { order_id: order.order_id });

        // Update inventory and other post-payment tasks...
        try { await axios.patch(`${PRODUCTS_BASEURL}/updateQuantity`, { products: order.products }); } catch (e) { }
        try { await axios.post(`${NOTIFICATIONS_BASEURL}/order-confirmation`, { to: order.email, order }); } catch (e) { }
        try { await axios.post(`${SHIPPING_BASEURL}`, { ordered_at: order.ordered_at, order_id: order.order_id, address: order.address, total: order.total }); } catch (e) { }

        res.status(200).json({ success: true, order_id: order.order_id });

    } catch (error) {
        logToFile("VERIFICATION ERROR", error);
        res.status(500).json({ message: "Internal server error during verification", error: error.message });
    }
};

export const webhook = async (req, res) => {
    res.status(200).send("OK");
};
