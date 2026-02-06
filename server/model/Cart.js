import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    default: 0   // 🔥 THIS FIXES MOST ERRORS
  }

}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
