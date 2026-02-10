import { stripe } from "../../index.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import generateId from "../../utils/generateId.js";
import { ORDERS_BASEURL, WEBSITE_BASE_URL, PRODUCTS_BASEURL } from "../../services/BaseURLs.js";

import Order from "../../model/Orders.js";
import { NOTIFICATIONS_BASEURL, SHIPPING_BASEURL } from "../../services/BaseURLs.js";

export const createCheckoutSession = async (req, res) => {
    try {
        try {
            let decodedCart;
            try {
                decodedCart = jwt.verify(
                    req.body.token,
                    process.env.JWT_SECRET_KEY || 'test'
                );
            } catch (jwtError) {
                console.error("Cart Token Verification Failed:", jwtError.message);
                return res.status(400).json({
                    message: "Invalid or expired cart session. Please refresh your cart.",
                    error: jwtError.message
                });
            }
            const { products, total } = decodedCart;
            const { data } = req.body;
            const userId = req.user.id; // From auth

            const order_id = generateId();

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"], // Removed UPI for simplicity in test mode if needed, or keep it.
                mode: "payment",
                line_items: products.map((product) => {
                    return {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: product.name,
                            },
                            unit_amount: parseInt(product.price * 100),
                        },
                        quantity: product.quantity || 1,
                    };
                }),
                payment_intent_data: {
                    metadata: {
                        order_id: order_id,
                        user_id: userId,
                        firstName: data.name.first,
                        lastName: data.name.last,
                        email: data.email,
                        phone_number: data.phone_number,
                        address: JSON.stringify({
                            country: data.address.country,
                            state: data.address.state,
                            city: data.address.city,
                            pincode: data.address.pincode,
                            area: data.address.area,
                            street: data.address.street,
                        }),
                        products: JSON.stringify(
                            products.map((product) => {
                                return {
                                    product_id: product.product_id,
                                    name: product.name,
                                    quantity: product.quantity,
                                };
                            })
                        ),
                        total: total,
                    },
                },
                success_url: `${WEBSITE_BASE_URL}/checkout/success?order=${order_id}`,
                cancel_url: `${WEBSITE_BASE_URL}/cart`,
            });

            res.status(201).json({ url: session.url });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } catch (outerError) {
        console.error("Checkout Session Error:", outerError.message);
        res.status(500).json({ message: "Failed to create checkout session", error: outerError.message });
    }
};

    export const webhook = async (req, res) => {
        const eventType = req.body.type;
        const { metadata } = req.body.data.object;
        try {
            if (eventType === "charge.succeeded" || eventType === "payment_intent.succeeded") {
                // Check if order already exists to avoid duplicates
                const existingOrder = await Order.findOne({ order_id: metadata.order_id });
                if (existingOrder) return res.status(200).json({ message: "Order already exists" });

                const order = new Order({
                    order_id: metadata.order_id,
                    user_id: metadata.user_id,
                    name: {
                        first: metadata.firstName,
                        last: metadata.lastName,
                    },
                    email: metadata.email,
                    phone_number: metadata.phone_number,
                    address: JSON.parse(metadata.address),
                    ordered_at: Date.now(),
                    products: JSON.parse(metadata.products),
                    total: metadata.total,
                    status: 'CONFIRMED',
                    payment_method: 'CARD', // Assuming Card for Stripe
                    payment_status: 'PAID'
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
                        { to: order.email, order }
                    );
                } catch (e) {
                    console.log("Notification error", e.message);
                }

                // Create Shipment
                await axios.post(`${SHIPPING_BASEURL}`, {
                    ordered_at: order.ordered_at,
                    order_id: order.order_id,
                    address: order.address,
                    total: order.total,
                });
            }
            res.status(200).json(metadata);
        } catch (error) {
            console.log("Webhook Error:", error.message);
            res.status(404).json({ message: error.message });
        }
    };
