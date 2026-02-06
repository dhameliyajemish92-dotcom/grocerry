import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

  user: {
    type: String,
    required: true
  },

  products: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],

  total: {
    type: Number,
    required: true
  },

  address: {
    type: Object,
    required: true
  },

  orderId: {
    type: String,
    required: true,
    unique: true
  },

  payment_method: {
    type: String,
    enum: ["upi", "card", "netbanking", "cod"],
    required: true
  },

  payment_status: {
    type: String,
    enum: ["paid", "pending"],
    default: "pending"
  },

  status: {
    type: String,
    default: "pending"
  }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
