import Order from "../../model/Orders.js";
import Pagination from "../../utils/pagination.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/sendEmail.js";
import PDFDocument from "pdfkit";

import {
    PRODUCTS_BASEURL,
    NOTIFICATIONS_BASEURL,
    SHIPPING_BASEURL,
    WEBSITE_BASE_URL
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

        const order = new Order({
            order_id: generateId(),
            user_id: userId,
            name: { first: data.firstName, last: data.lastName },
            email: data.email,
            phone_number: data.phone_number,
            address: typeof data.address === "string" ? JSON.parse(data.address) : data.address,
            ordered_at: Date.now(),
            products: typeof data.products === "string" ? JSON.parse(data.products) : data.products,
            total: data.total,
            payment_method: payment_method || "COD",
            payment_status: "PENDING",
            status: "CONFIRMED"
        });

        await order.save();

        try {
            await axios.patch(`${PRODUCTS_BASEURL}/updateQuantity`, { products: order.products });
        } catch (e) { console.warn("Quantity update fail:", e.message); }

        try {
            await axios.post(`${NOTIFICATIONS_BASEURL}/order-confirmation`, { to: order.email, order });
            await axios.post(`${SHIPPING_BASEURL}`, { ordered_at: order.ordered_at, order_id: order.order_id, address: order.address, total: order.total });
        } catch (e) { console.warn("Notification/Shipment fail:", e.message); }

        res.status(200).json({ order_id: order.order_id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   CREATE ORDER (COD via JWT)
========================= */
export const createOrderCOD = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
        const { token, data } = req.body;
        if (!token || !data) return res.status(400).json({ message: "Token and data required" });

        let decodedCart;
        try {
            decodedCart = jwt.verify(token, process.env.JWT_SECRET_KEY || 'test');
        } catch (jwtErr) { return res.status(400).json({ message: "Invalid cart token" }); }

        const { products, total } = decodedCart;
        const order = new Order({
            order_id: generateId(),
            user_id: req.user.id,
            name: { first: data.name?.first || 'N/A', last: data.name?.last || 'N/A' },
            email: data.email || '',
            phone_number: data.phone_number || '',
            address: data.address || {},
            ordered_at: Date.now(),
            products,
            total,
            status: "CONFIRMED",
            payment_method: "COD",
            payment_status: "PENDING",
        });

        await order.save();

        try {
            await axios.patch(`${PRODUCTS_BASEURL}/updateQuantity`, { products: order.products });
            await axios.post(`${NOTIFICATIONS_BASEURL}/order-confirmation`, { to: order.email, order });
            await axios.post(`${SHIPPING_BASEURL}`, { ordered_at: order.ordered_at, order_id: order.order_id, address: order.address, total: order.total });
        } catch (e) { console.warn("Sub-service post-order fail:", e.message); }

        res.status(200).json({ order_id: order.order_id });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/* =========================
   GET SINGLE ORDER
========================= */
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ order_id: req.params.id });
        if (!order) return res.status(404).json({ message: "Order not found" });

        const productIds = order.products.map(p => p.product_id || p.id);
        let mergedProducts = order.products;

        try {
            const { data } = await axios.post(`${PRODUCTS_BASEURL}/arr`, { arr: productIds });
            if (data && data.length > 0) {
                mergedProducts = data.map(product => {
                    const orderProduct = order.products.find(p => (p.product_id || p.id) === product.id);
                    return {
                        ...orderProduct, ...product,
                        quantity: orderProduct ? orderProduct.quantity : 1,
                        price: product.pricing?.selling_price || product.pricing?.mrp || product.price || orderProduct?.price || 0,
                        image: product.image || orderProduct?.image
                    };
                });
            }
        } catch (e) { console.warn("Product fetch fail:", e.message); }

        res.status(200).json({ ...order._doc, products: mergedProducts });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

/* =========================
   ADMIN: GET ALL ORDERS
========================= */
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ ordered_at: -1 });
        const ordersPaged = Pagination(req.query.page, orders);
        const total_pages = Math.ceil((await Order.countDocuments()) / 20);
        res.status(200).json({ total_pages, orders: ordersPaged });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/* =========================
   ADMIN: UPDATE ORDER STATUS
========================= */
export const updateOrder = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
        if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

        const updated = await Order.findOneAndUpdate({ order_id: req.params.id }, { status }, { new: true });
        if (!updated) return res.status(404).json({ message: "Order not found" });

        try {
            const Shipments = (await import('../../model/Shipments.js')).default;
            if (['SHIPPED', 'DELIVERED'].includes(status)) {
                await Shipments.findOneAndUpdate({ order_id: req.params.id }, { status }, { new: true });
            }
        } catch (e) { console.warn("Shipment sync fail:", e.message); }

        res.status(200).json(updated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/* =========================
   USER: ORDER HISTORY
========================= */
export const getOrderHistory = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
        const orders = await Order.find({ user_id: req.user.id }).sort({ ordered_at: -1 });
        res.status(200).json(orders);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/* =========================
   ADMIN: CREATE ORDER
========================= */
export const createOrderAdmin = async (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, address, products, total, paymentMethod } = req.body;
        const nameParts = customerName.split(" ");
        const order = new Order({
            order_id: generateId(), user_id: "ADMIN_CREATED",
            name: { first: nameParts[0] || "", last: nameParts.slice(1).join(" ") || "" },
            email: customerEmail || "", phone_number: customerPhone || "",
            address: typeof address === "string" ? JSON.parse(address) : (address || {}),
            ordered_at: Date.now(), products: typeof products === "string" ? JSON.parse(products) : products,
            total: parseFloat(total), payment_method: paymentMethod || "CASH",
            payment_status: paymentMethod === "ONLINE" ? "PAID" : "PENDING", status: "CONFIRMED"
        });
        await order.save();
        try {
            await axios.post(`${SHIPPING_BASEURL}`, { ordered_at: order.ordered_at, order_id: order.order_id, address: order.address, total: order.total });
        } catch (e) { console.warn("Shipment creation fail:", e.message); }
        res.status(200).json({ order_id: order.order_id, message: "Order created successfully" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/* =========================
   DOWNLOAD INVOICE PDF
========================= */
export const downloadInvoice = async (req, res) => {
    try {
        const order_id = req.params.id;
        const order = await Order.findOne({ order_id });
        if (!order) return res.status(404).json({ message: "Order not found" });

        let products = order.products;
        try {
            const productIds = order.products.map(p => p.product_id || p.id);
            const { data } = await axios.post(`${PRODUCTS_BASEURL}/arr`, { arr: productIds });
            if (data && data.length > 0) {
                products = data.map(product => {
                    const orderProduct = order.products.find(p => (p.product_id || p.id) === product.id);
                    return {
                        ...orderProduct, ...product,
                        quantity: orderProduct ? orderProduct.quantity : 1,
                        price: product.pricing?.selling_price || product.pricing?.mrp || product.price || orderProduct?.price || 0,
                        image: product.image || orderProduct?.image
                    };
                });
            }
        } catch (e) { console.warn("Product fetch fail for download:", e.message); }

        const pdfBuffer = await generateInvoicePDFBuffer(order, products, 5);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order.order_id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/* =========================
   SEND INVOICE EMAIL
========================= */
export const sendInvoiceEmail = async (req, res) => {
    try {
        const order_id = req.params.id;
        const order = await Order.findOne({ order_id });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (!order.email) return res.status(400).json({ message: "No email associated" });

        let products = order.products;
        try {
            const productIds = order.products.map(p => p.product_id || p.id);
            const { data } = await axios.post(`${PRODUCTS_BASEURL}/arr`, { arr: productIds });
            if (data && data.length > 0) {
                products = data.map(product => {
                    const orderProduct = order.products.find(p => (p.product_id || p.id) === product.id);
                    const imageUrl = product.image || orderProduct?.image;
                    return {
                        ...orderProduct, ...product,
                        quantity: orderProduct ? orderProduct.quantity : 1,
                        price: product.pricing?.selling_price || product.pricing?.mrp || product.price || orderProduct?.price || 0,
                        image: imageUrl
                    };
                });
            }
        } catch (e) { console.warn("Product fetch fail for email:", e.message); }

        const GST_RATE = 5;
        const pdfBuffer = await generateInvoicePDFBuffer(order, products, GST_RATE);
        const orderDate = new Date(order.ordered_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const name = order.name || { first: 'Customer', last: '' };

        const html = `<!DOCTYPE html><html><body><div style="background-color:#00b106;padding:20px;color:white;text-align:center;"><h1>Order Invoice</h1></div><div style="padding:20px;border:1px solid #ddd;"><h2>Order #${order.order_id}</h2><p><strong>Total:</strong> Rs. ${order.total.toFixed(2)}</p><p>Dear ${name.first}, please find your invoice attached.</p></div></body></html>`;

        const attachments = [{ filename: `Invoice_${order.order_id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }];
        await sendEmail(order.email, `Invoice - Order #${order.order_id}`, "Your invoice is attached.", html, attachments);
        res.status(200).json({ message: "Invoice sent successfully" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/* =========================
    PDF GENERATION HELPER
 ========================= */
const generateInvoicePDFBuffer = async (order, products, GST_RATE) => {
    console.log(`[PDF] Generating for ${order.order_id} with ${products.length} products`);
    
    const productImages = await Promise.all(products.map(async (p, idx) => {
        let imgUrl = p?.image;
        console.log(`[PDF] Product ${idx}: ${p.name}, image: ${imgUrl}`);
        
        if (!imgUrl || typeof imgUrl !== 'string') {
            return null;
        }
        
        const baseUrls = ['https://grocerapp.vercel.app', 'http://localhost:3000'];
        
        for (const baseUrl of baseUrls) {
            let urlToTry = imgUrl.startsWith('http') ? imgUrl : `${baseUrl}${imgUrl}`;
            try {
                console.log(`[PDF] Fetching: ${urlToTry}`);
                const response = await axios.get(urlToTry, { responseType: 'arraybuffer', timeout: 8000 });
                if (response.data && response.data.length > 100) {
                    console.log(`[PDF] Image loaded: ${response.data.length} bytes`);
                    return Buffer.from(response.data);
                }
            } catch (e) {
                console.log(`[PDF] Error: ${e.message}`);
            }
        }
        
        return null;
    }));

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const orderDate = new Date(order.ordered_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const address = order.address || {};
        const addressStr = `${address.street || ''}, ${address.area || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;

        const drawHeader = () => {
            doc.rect(0, 0, 595, 60).fill('#00b106');
            doc.fontSize(22).fillColor('white').text('TAX INVOICE', 0, 15, { align: 'center' });
            doc.fontSize(10).text('Grocery | GSTIN: 27AAPCR1234F1Z5', 0, 40, { align: 'center' });
        };

        const drawTableHeader = (yPos) => {
            doc.rect(40, yPos, 515, 20).fill('#00b106');
            doc.fontSize(8).fillColor('white').font('Helvetica-Bold');
            doc.text('S.No', 45, yPos + 6); 
            doc.text('Img', 70, yPos + 6); 
            doc.text('Item', 105, yPos + 6); 
            doc.text('Qty', 280, yPos + 6);
            doc.text('Rate', 310, yPos + 6); 
            doc.text('GST %', 360, yPos + 6); 
            doc.text('GST Amt', 400, yPos + 6); 
            doc.text('Total', 465, yPos + 6);
        };

        drawHeader(); doc.fillColor('black'); let y = 80;
        doc.fontSize(11).font('Helvetica-Bold').text('Invoice Details', 40, y); doc.text('Customer Details', 310, y); y += 18;
        doc.fontSize(9).font('Helvetica');
        doc.text(`Invoice No: INV-${order.order_id}`, 40, y); doc.text(`Name: ${order.name?.first} ${order.name?.last}`, 310, y); y += 11;
        doc.text(`Date: ${orderDate}`, 40, y); doc.text(`Email: ${order.email || 'N/A'}`, 310, y); y += 11;
        doc.text(`Order ID: #${order.order_id}`, 40, y); doc.text(`Phone: ${order.phone_number || 'N/A'}`, 310, y); y += 11;
        doc.text(`Payment: ${order.payment_method || 'N/A'}`, 40, y); doc.text(`Address: ${addressStr.substring(0, 60)}...`, 310, y, { width: 220 }); y += 11;
        doc.text(`Status: ${order.status}`, 40, y); y += 25;

        doc.moveTo(40, y).lineTo(555, y).strokeColor('#00b106').lineWidth(1).stroke(); y += 10;
        drawTableHeader(y); y += 25;
        doc.fillColor('black').font('Helvetica'); let subtotal = 0, totalGST = 0;

        products.forEach((p, i) => {
            if (y > 700) { doc.addPage(); drawHeader(); y = 80; drawTableHeader(y); y += 25; doc.fillColor('black'); }
            
            const nameStr = (p.name || p.product_id || 'Item').substring(0, 30);
            const qty = p.quantity || 1, price = p.price || 0, itemTotal = price * qty;
            const basePrice = itemTotal / (1 + GST_RATE / 100), gstAmount = itemTotal - basePrice;
            subtotal += basePrice; totalGST += gstAmount;
            
            doc.fontSize(8); 
            doc.text(String(i+1), 48, y + 10);
            
            // Draw Product Image
            if (productImages[i]) {
                try {
                    doc.image(productImages[i], 70, y, { fit: [25, 25] });
                } catch (imgErr) {
                    console.error("PDF image draw fail:", imgErr.message);
                }
            } else {
                doc.rect(70, y, 25, 25).stroke('#eee');
                doc.fontSize(6).text('No Img', 72, y + 10);
                doc.fontSize(8);
            }
            
            doc.text(nameStr, 105, y + 10); 
            doc.text(String(qty), 285, y + 10);
            doc.text(basePrice.toFixed(2), 310, y + 10); 
            doc.text(`${GST_RATE}%`, 365, y + 10);
            doc.text(gstAmount.toFixed(2), 405, y + 10); 
            doc.text(itemTotal.toFixed(2), 470, y + 10);
            
            y += 35; // Increased row height for images
            doc.moveTo(40, y - 5).lineTo(555, y - 5).strokeColor('#eee').lineWidth(0.5).stroke();
        });

        y += 10; if (y > 650) { doc.addPage(); y = 80; }
        doc.moveTo(40, y).lineTo(555, y).strokeColor('#00b106').lineWidth(1).stroke(); y += 15;
        const boxX = 280, boxW = 275, boxH = 110;
        doc.rect(boxX, y, boxW, boxH).fill('#f8f8f8').stroke('#ccc');
        doc.fillColor('black').fontSize(9).font('Helvetica');
        let rY = y + 10; const lX = boxX + 10, vX = boxX + 130, vW = boxW - 140;
        doc.text(`Subtotal (excl. GST):`, lX, rY); doc.text(`${subtotal.toFixed(2)}`, vX, rY, { width: vW, align: 'right' });
        rY += 18; doc.text(`CGST (${GST_RATE/2}%):`, lX, rY); doc.text(`${(totalGST/2).toFixed(2)}`, vX, rY, { width: vW, align: 'right' });
        rY += 18; doc.text(`SGST (${GST_RATE/2}%):`, lX, rY); doc.text(`${(totalGST/2).toFixed(2)}`, vX, rY, { width: vW, align: 'right' });
        rY += 18; doc.text(`Total (incl. GST):`, lX, rY); doc.text(`${totalGST.toFixed(2)}`, vX, rY, { width: vW, align: 'right' });
        rY += 22; doc.rect(boxX, rY - 5, boxW, 30).fill('#00b106');
        doc.fillColor('white').fontSize(12).font('Helvetica-Bold');
        doc.text('Grand Total (Rs):', lX, rY + 3); doc.text(`${order.total.toFixed(2)}`, vX, rY + 3, { width: vW, align: 'right' });
        doc.end();
    });
};
