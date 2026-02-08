import mongoose from "mongoose";

const { Schema } = mongoose;

const UsersSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: "USER" },
    phone: { type: String },
    wishlist: { type: Array },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    address: {
        country: String,
        state: String,
        city: String,
        pincode: String,
        area: String,
        street: String
    }
});

const Users = mongoose.model('Users', UsersSchema);
export default Users;