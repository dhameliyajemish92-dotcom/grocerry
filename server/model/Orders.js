import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        first: String,
        last: String
    },
    email: { type: String, required: false },
    phone_number: { type: String, required: false },
    address: {
        country: String,
        state: String,
        city: String,
        pincode: String,
        area: String,
        street: String
    },
    ordered_at: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
        default: 'CONFIRMED'
    },
    payment_method: {
        type: String,
        enum: ['CARD', 'UPI', 'COD'],
        required: true
    },
    payment_status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    tracking_id: String,
    products: { type: Array, required: true },
    total: { type: Number, required: true }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;