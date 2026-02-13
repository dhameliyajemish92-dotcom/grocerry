// import sgMail from '@sendgrid/mail';
import OrderConfirmationTemplate from "./templates/OrderConfirmationTemplate.js";

const defaults = {
    from: {
        name: 'Grocery',
        email: 'hey.baraa@gmail.com',
    }
}

export const orderConfirmation = async (req, res) => {
    const { to, order } = req.body;

    const email = {
        ...defaults,
        to,
        subject: "Order Confirmation",
        text: `Your order #${order.order_id} has been placed successfully. ${order.products.length} items will be sent to ${order.address} by ${order.ordered_at}. Your grand total is ${order.total}`,
        html: OrderConfirmationTemplate(order)
    }

    await sendEmail(email, res);
}

// WhatsApp notification for shipment status
export const sendWhatsAppStatus = async (phoneNumber, order, status) => {
    try {
        // Format phone number (remove any non-digits and add country code if needed)
        const formattedPhone = phoneNumber.replace(/\D/g, '');
        
        // Create message based on status
        const statusMessages = {
            'CREATED': `📦 Your order #${order.order_id} has been confirmed! We're preparing your items.`,
            'SHIPPED': `🚚 Great news! Your order #${order.order_id} has been shipped and is on its way to you.`,
            'DELIVERED': `✅ Your order #${order.order_id} has been delivered! Thank you for shopping with us.`,
            'RETURNED': `↩️ Your order #${order.order_id} has been returned. Please contact us for assistance.`
        };
        
        const message = statusMessages[status] || `📦 Order #${order.order_id} status updated to: ${status}`;
        
        // Create WhatsApp deep link (works on mobile with WhatsApp installed)
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        
        // Also return a clickable link for web
        const webMessage = `${message}\n\nTrack your shipment: http://localhost:3000/shipping/${order.order_id}`;
        
        console.log("WhatsApp URL:", whatsappUrl);
        console.log("Web Message:", webMessage);
        
        return { url: whatsappUrl, message: webMessage };
    } catch (e) {
        console.error("WhatsApp notification error:", e);
        return null;
    }
}

const sendEmail = async (email, res) => {
    try {
        // await sgMail.send(email);
        console.log("Email simulation:", email);
        res.status(200).json({ email, result: 'Sent Successfully (Simulated)' });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}