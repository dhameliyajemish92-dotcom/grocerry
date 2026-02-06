import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import payments from "./routes/payments.js";
import orders from "./routes/orders.js";

import Stripe from "stripe";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(bodyParser.json());
app.use(cors());

/* Stripe */
export const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

/* MongoDB Atlas Connect */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

connectDB();

/* Routes */
app.use("/payments", payments);
app.use("/orders", orders);

app.get("/", (req, res) => {
  res.json({ status: "Server running fine 🚀" });
});

/* Server start */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
