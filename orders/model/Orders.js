import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    first: { type: String },
    last: { type: String }
  },
  email: String,
  phone_number: String,

  address: {
    country: String,
    city: String,
    area: String,
    street: String,
    building_number: String,
    floor: String,
    apartment_number: String
  },

  ordered_at: {
    type: Date,
    default: Date.now   // ⭐ important
  },

  status: {
    type: String,
    enum: ['CREATED', 'PROCESSING', 'FULFILLED', 'CANCELLED'],
    default: 'CREATED'
  },

  products: {
    type: [Object],    // ❗ array ka proper type
    required: true
  },

  total: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
