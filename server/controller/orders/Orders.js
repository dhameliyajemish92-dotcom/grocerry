import Order from "../../model/Orders.js";
import Pagination from "../../utils/pagination.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/sendEmail.js";
import PDFDocument from "pdfkit";

import {
    PRODUCTS_BASEURL,
    NOTIFICATIONS_BASEURL,
    SHIPPING_BASEURL
} from "../../services/BaseURLs.js";

import generateId from "../../utils/generateId.js";

/* =========================
   CREATE ORDER (ONLINE/COD)
========================= */
export const createOrder = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { data, payment_method } = req.body;
        const userId = req.user.id;

        console.log("Order Creation - User ID:", userId);
        console.log("Order Creation - Payment Method:", payment_method);

        const order = new Order({
            order_id: generateId(),
            user_id: userId,
            name: {
                first: data.firstName,
                last: data.lastName,
            },
            email: data.email,
            phone_number: data.phone_number,
            address: typeof data.address === "string"
                ? JSON.parse(data.address)
                : data.address,
            ordered_at: Date.now(),
            products: typeof data.products === "string"
                ? JSON.parse(data.products)
                : data.products,
            total: data.total,
            payment_method: payment_method || "COD",
            payment_status: "PENDING",
            status: "CONFIRMED"
        });

        await order.save();
        console.log("Order saved successfully:", order.order_id);

        try {
            console.log("Updating product quantities...");
            await axios.patch(`${PRODUCTS_BASEURL}/updateQuantity`, {
                products: order.products,
            });
            console.log("Product quantities updated");
        } catch (e) {
            console.log("Product quantity update failed:", e.message);
        }

        try {
            console.log("Sending order confirmation notification...");
            await axios.post(`${NOTIFICATIONS_BASEURL}/order-confirmation`, {
                to: order.email,
                order,
            });
            console.log("Notification sent");

            console.log("Creating shipment...");
            await axios.post(`${SHIPPING_BASEURL}`, {
                ordered_at: order.ordered_at,
                order_id: order.order_id,
                address: order.address,
                total: order.total,
            });
            console.log("Shipment created");
        } catch (e) {
            console.log("Sub-service error:", e.message);
        }

        console.log("Order creation completed successfully");
        res.status(200).json({ order_id: order.order_id });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: error.message, error: error.toString() });
    }
};

/* =========================
   CREATE ORDER (COD via JWT)
========================= */
export const createOrderCOD = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { token, data } = req.body;
        const userId = req.user.id;

        if (!token || !data) {
            return res.status(400).json({
                message: "Token and data are required"
            });
        }

        console.log("COD Order - Attempting to verify cart token");

        let decodedCart;
        try {
            decodedCart = jwt.verify(
                token,
                process.env.JWT_SECRET_KEY || 'test'
            );
            console.log("Cart token verified successfully");
        } catch (jwtErr) {
            console.error("Cart token verification failed:", jwtErr.message);
            return res.status(400).json({
                message: "Invalid or expired cart token",
                error: jwtErr.message
            });
        }

        const { products, total } = decodedCart;

        if (!products || products.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        console.log("Creating order with", products.length, "items");

        const order = new Order({
            order_id: generateId(),
            user_id: userId,
            name: {
                first: data.name?.first || 'N/A',
                last: data.name?.last || 'N/A',
            },
            email: data.email || '',
            phone_number: data.phone_number || '',
            address: {
                country: data.address?.country || '',
                state: data.address?.state || '',
                city: data.address?.city || '',
                pincode: data.address?.pincode || '',
                area: data.address?.area || '',
                street: data.address?.street || '',
            },
            ordered_at: Date.now(),
            products,
            total,
            status: "CONFIRMED",
            payment_method: "COD",
            payment_status: "PENDING",
        });

        await order.save();
        console.log("Order saved successfully with ID:", order.order_id);

        // Try to update quantities but don't fail the entire request
        try {
            await axios.patch(`${PRODUCTS_BASEURL}/updateQuantity`, {
                products: order.products,
            });
            console.log("Product quantities updated");
        } catch (e) {
            console.warn("Product quantity update failed (non-critical):", e.message);
        }

        // Try to send notification but don't fail
        try {
            await axios.post(`${NOTIFICATIONS_BASEURL}/order-confirmation`, {
                to: data.email,
                order,
            });
            console.log("Notification sent");
        } catch (e) {
            console.warn("Notification failed (non-critical):", e.message);
        }

        // Try to create shipment but don't fail
        try {
            await axios.post(`${SHIPPING_BASEURL}`, {
                ordered_at: order.ordered_at,
                order_id: order.order_id,
                address: order.address,
                total: order.total,
            });
            console.log("Shipment created");
        } catch (e) {
            console.warn("Shipment creation failed (non-critical):", e.message);
        }

        console.log("Order creation completed successfully");
        res.status(200).json({ order_id: order.order_id });
    } catch (error) {
        console.error("COD Order Creation Error:", error);
        res.status(500).json({
            message: error.message || "Failed to create order",
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
};

/* =========================
   GET SINGLE ORDER
========================= */
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ order_id: req.params.id });
        if (!order) {
            return res.status(404).json({ message: "Order does not exist" });
        }

        const productIds = order.products.map(p => p.product_id || p.id);
        let mergedProducts = order.products; // Fallback to original order products

        try {
            const { data } = await axios.post(`${PRODUCTS_BASEURL}/arr`, {
                arr: productIds,
            });

            if (data && data.length > 0) {
                // Merge results with robust fallbacks
                mergedProducts = data.map(product => {
                    const orderProduct = order.products.find(p => (p.product_id || p.id) === product.id);
                    return {
                        ...orderProduct, // Use original order data as base (has name, price, image)
                        ...product,      // Overlay with fresh data from microservice if available
                        quantity: orderProduct ? orderProduct.quantity : 1,
                        price: product.pricing?.selling_price || product.pricing?.mrp || product.price || orderProduct?.price || 0,
                        image: product.image || orderProduct?.image
                    };
                });
            }
        } catch (e) {
            console.warn("Could not fetch product details for invoice:", e.message);
            // Already initialized with order.products
        }

        res.status(200).json({ ...order._doc, products: mergedProducts });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/* =========================
   ADMIN: GET ALL ORDERS
   Uses adminAuth middleware via route
========================= */
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ ordered_at: -1 });
        const ordersPaged = Pagination(req.query.page, orders);
        const total_pages = Math.ceil((await Order.countDocuments()) / 20);

        res.status(200).json({ total_pages, orders: ordersPaged });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   ADMIN: UPDATE ORDER STATUS
   Uses adminAuth middleware via route
========================= */
export const updateOrder = async (req, res) => {
    try {
        const { status } = req.body;

        const allowed = [
            "CONFIRMED",
            "PACKED",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
        ];

        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        const updated = await Order.findOneAndUpdate(
            { order_id: req.params.id },
            { status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Order does not exist" });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   USER: ORDER HISTORY
========================= */
export const getOrderHistory = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const orders = await Order.find({
            user_id: req.user.id,
        }).sort({ ordered_at: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   ADMIN: CREATE ORDER
   ========================= */
export const createOrderAdmin = async (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, address, products, total, paymentMethod } = req.body;

        if (!customerName || !products || !total) {
            return res.status(400).json({ message: "Customer name, products, and total are required" });
        }

        // Split name into first and last
        const nameParts = customerName.split(" ");
        const name = {
            first: nameParts[0] || "",
            last: nameParts.slice(1).join(" ") || ""
        };

        const order = new Order({
            order_id: generateId(),
            user_id: "ADMIN_CREATED", // Mark as admin created
            name,
            email: customerEmail || "",
            phone_number: customerPhone || "",
            address: typeof address === "string" ? JSON.parse(address) : (address || {}),
            ordered_at: Date.now(),
            products: typeof products === "string" ? JSON.parse(products) : products,
            total: parseFloat(total),
            payment_method: paymentMethod || "CASH",
            payment_status: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
            status: "CONFIRMED"
        });

        await order.save();
        console.log("Admin Order saved successfully:", order.order_id);

        // Create shipment
        try {
            await axios.post(`${SHIPPING_BASEURL}`, {
                ordered_at: order.ordered_at,
                order_id: order.order_id,
                address: order.address,
                total: order.total,
            });
            console.log("Shipment created for admin order");
        } catch (e) {
            console.warn("Shipment creation failed (non-critical):", e.message);
        }

        res.status(200).json({
            order_id: order.order_id,
            message: "Order created successfully"
        });
    } catch (error) {
        console.error("Admin Order Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   SEND RECEIPT EMAIL WITH PDF
========================= */
export const sendReceiptEmail = async (req, res) => {
    try {
        const order_id = req.params.id;

        const order = await Order.findOne({ order_id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.email) {
            return res.status(400).json({ message: "No email address associated with this order" });
        }

        // Get product details
        let products = order.products;
        try {
            const productIds = order.products.map(p => p.product_id || p.id);
            const { data } = await axios.post(`${PRODUCTS_BASEURL}/arr`, {
                arr: productIds,
            });

            // Merge quantities and map prices
            if (data && data.length > 0) {
                products = data.map(product => {
                    const orderProduct = order.products.find(p => (p.product_id || p.id) === product.id);
                    return {
                        ...orderProduct,
                        ...product,
                        quantity: orderProduct ? orderProduct.quantity : 1,
                        price: product.pricing?.selling_price || product.pricing?.mrp || product.price || orderProduct?.price || 0
                    };
                });
            }
        } catch (e) {
            console.warn("Could not fetch product details for receipt:", e.message);
        }

        const orderDate = new Date(order.ordered_at).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const address = order.address;
        const addressStr = `${address.street || ''}, ${address.area || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;

        const GST_RATE = 5;

        // Generate PDF
        const pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.rect(0, 0, 595, 60).fill('#00b106');
            doc.fontSize(22).fillColor('white').text('TAX INVOICE', 0, 15, { align: 'center' });
            doc.fontSize(10).text('Grocery | GSTIN: 27AAPCR1234F1Z5', 0, 40, { align: 'center' });

            doc.fillColor('black');
            let y = 80;

            // Invoice & Customer Details
            doc.fontSize(11).font('Helvetica-Bold').text('Invoice Details', 40, y);
            doc.text('Customer Details', 310, y);
            y += 18;

            doc.fontSize(9).font('Helvetica');
            doc.text(`Invoice No: INV-${order.order_id}`, 40, y);
            doc.text(`Name: ${order.name.first} ${order.name.last}`, 310, y);
            y += 14;
            doc.text(`Date: ${orderDate}`, 40, y);
            doc.text(`Email: ${order.email}`, 310, y);
            y += 14;
            doc.text(`Order ID: #${order.order_id}`, 40, y);
            doc.text(`Phone: ${order.phone_number}`, 310, y);
            y += 14;
            doc.text(`Payment: ${order.payment_method || 'N/A'}`, 40, y);
            doc.text(`Address: ${addressStr}`, 310, y, { width: 220 });
            y += 14;
            doc.text(`Status: ${order.status}`, 40, y);
            y += 20;

            // Separator
            doc.moveTo(40, y).lineTo(555, y).strokeColor('#00b106').lineWidth(1).stroke();
            y += 10;

            // Table Header
            doc.rect(40, y, 515, 20).fill('#00b106');
            doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
            doc.text('S.No', 45, y + 6);
            doc.text('Item', 70, y + 6);
            doc.text('Qty', 280, y + 6);
            doc.text('Rate', 310, y + 6);
            doc.text('GST %', 360, y + 6);
            doc.text('GST Amt', 400, y + 6);
            doc.text('Total', 460, y + 6);
            y += 25;

            doc.fillColor('black').font('Helvetica');

            let subtotal = 0;
            let totalGST = 0;

            products.forEach((p, i) => {
                if (y > 700) {
                    doc.addPage();
                    y = 40;
                }
                const name = (p.name || p.product_id || 'Item').substring(0, 35);
                const qty = p.quantity || 1;
                const price = p.price || 0;
                const itemTotal = price * qty;
                const basePrice = itemTotal / (1 + GST_RATE / 100);
                const gstAmount = itemTotal - basePrice;

                subtotal += basePrice;
                totalGST += gstAmount;

                doc.fontSize(8);
                doc.text(String(i + 1), 48, y);
                doc.text(name, 70, y);
                doc.text(String(qty), 285, y);
                doc.text(basePrice.toFixed(2), 305, y);
                doc.text(`${GST_RATE}%`, 365, y);
                doc.text(gstAmount.toFixed(2), 400, y);
                doc.text(itemTotal.toFixed(2), 458, y);
                y += 15;

                doc.moveTo(40, y - 4).lineTo(555, y - 4).strokeColor('#eee').lineWidth(0.5).stroke();
            });

            y += 10;
            doc.moveTo(40, y).lineTo(555, y).strokeColor('#00b106').lineWidth(1).stroke();
            y += 15;

            // GST Summary
            const boxX = 350;
            doc.rect(boxX, y, 205, 80).fill('#f8f8f8').stroke('#ccc');

            doc.fillColor('black').fontSize(9).font('Helvetica');
            doc.text(`Subtotal (excl. GST):`, boxX + 5, y + 8);
            doc.text(`Rs. ${subtotal.toFixed(2)}`, boxX + 200, y + 8, { align: 'right', width: 0 });

            doc.text(`CGST (${GST_RATE / 2}%):`, boxX + 5, y + 22);
            doc.text(`Rs. ${(totalGST / 2).toFixed(2)}`, boxX + 200, y + 22, { align: 'right', width: 0 });

            doc.text(`SGST (${GST_RATE / 2}%):`, boxX + 5, y + 36);
            doc.text(`Rs. ${(totalGST / 2).toFixed(2)}`, boxX + 200, y + 36, { align: 'right', width: 0 });

            doc.text(`Total GST (${GST_RATE}%):`, boxX + 5, y + 50);
            doc.text(`Rs. ${totalGST.toFixed(2)}`, boxX + 200, y + 50, { align: 'right', width: 0 });

            // Grand Total
            doc.rect(boxX, y + 65, 205, 20).fill('#00b106');
            doc.fillColor('white').fontSize(11).font('Helvetica-Bold');
            doc.text('Grand Total:', boxX + 5, y + 70);
            doc.text(`Rs. ${order.total.toFixed(2)}`, boxX + 200, y + 70, { align: 'right', width: 0 });

            y += 100;

            // Note
            doc.fillColor('#666').fontSize(7).font('Helvetica');
            doc.text(`Note: GST is calculated at ${GST_RATE}% (${GST_RATE / 2}% CGST + ${GST_RATE / 2}% SGST) inclusive in product prices.`, 40, y);

            // Footer
            doc.fillColor('#999').fontSize(7);
            doc.text('This is a computer-generated invoice and does not require a signature.', 0, 780, { align: 'center' });
            doc.text('Thank you for shopping with Grocery!', 0, 790, { align: 'center' });

            doc.end();
        });

        console.log("PDF generated, size:", pdfBuffer.length, "bytes");

        // HTML email body
        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #00b106; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Order Invoice</h1>
            </div>
            <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333;">Order #${order.order_id}</h2>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Total:</strong> Rs. ${order.total.toFixed(2)} (incl. ${GST_RATE}% GST)</p>
                <p><strong>Payment:</strong> ${order.payment_method || 'N/A'}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <hr style="border: 1px solid #eee;">
                <p>Dear ${order.name.first} ${order.name.last},</p>
                <p>Please find your GST invoice attached as a PDF.</p>
                <p style="color: #666; font-size: 12px;">Thank you for shopping with Grocery!</p>
            </div>
        </body>
        </html>
        `;

        const textContent = `Order Invoice - #${order.order_id}\nDate: ${orderDate}\nTotal: Rs. ${order.total}\nPlease find your GST invoice attached.`;

        const attachments = [
            {
                filename: `Invoice_${order.order_id}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ];

        await sendEmail(order.email, `Invoice - Order #${order.order_id}`, textContent, html, attachments);

        res.status(200).json({ message: "Invoice sent successfully to " + order.email });
    } catch (error) {
        console.error("Send Receipt Email Error:", error);
        res.status(500).json({ message: error.message });
    }
};
