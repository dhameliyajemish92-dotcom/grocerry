import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true
    },

    last_name: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      default: "user"
    },

    wishlist: {
      type: Array,
      default: []
    },

    // 🔐 OTP verification
    otp: Number,
    otpExpire: Date,
    verified: {
      type: Boolean,
      default: false
    },

    // 🔑 Forgot password
    resetToken: String,
    resetExpire: Date
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema);
