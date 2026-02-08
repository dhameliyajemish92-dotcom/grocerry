import mongoose from "mongoose";

const CartSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    products: [{
        product_id: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        name: String,
        price: Number,
        image: String
    }]
});

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
