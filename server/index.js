import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import meRoutes from "./routes/me.js";
import Users from "./model/Users.js";
import Orders from "./model/Orders.js";
import Products from "./model/Products.js";

const app = express();

/* ===== MIDDLEWARE ===== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use("/me", meRoutes);

/* ===== JWT MIDDLEWARE ===== */

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.role = decoded.role;

    next();
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

/* ===== AUTH ===== */

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
});

/* ================================
          PRODUCTS
================================ */


// GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const products = await Products.find({});
    res.json({
      total_pages: 1,
      products
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEARCH PRODUCTS
app.get("/products/search", async (req, res) => {
  try {
    const search = req.query.search || "";

    const products = await Products.find({
      name: { $regex: search, $options: "i" }
    });

    res.json({
      total_pages: 1,
      products
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ SEARCH PRODUCTS  (THIS WAS MISSING)
app.get("/products/search", async (req, res) => {
  try {
    const search = req.query.search || "";

    const products = await Products.find({
      name: { $regex: search, $options: "i" }
    });

    res.json(products);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ ADD PRODUCT (BUG FIXED)
app.post("/products", async (req, res) => {
  try {
    const product = await Products.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================================
           ORDERS
================================ */

app.get("/orders", auth, async (req, res) => {
  const orders = await Orders.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

app.post("/orders", auth, async (req, res) => {

  const newOrder = {
    ...req.body,
    user: req.userId,
    orderId: "ORD" + Date.now() + Math.floor(Math.random() * 10000),
    payment_status: "paid",
    status: "paid"
  };

  const order = await Orders.create(newOrder);
  res.json(order);
});

/* ================================
         SHIPPING & PAYMENTS
================================ */

app.get("/shipping", auth, (req, res) => {
  res.json({ message: "Shipping working" });
});

app.post("/payments", auth, (req, res) => {
  res.json({ success: true });
});

/* ===== ROOT ===== */

app.get("/", (req, res) => {
  res.json({ success: true });
});

/* ================================
        DB + SERVER
================================ */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connected");
    app.listen(5000, () => console.log("Server running on 5000"));
  })
  .catch(console.log);
