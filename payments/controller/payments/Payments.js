import Order from "../../model/Orders.js";
import jwt from "jsonwebtoken";
import generateId from "../../utils/generateId.js";

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("🔥 API HIT");

    let decoded;

    try {
      decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("❌ JWT FAILED", err.message);
      return res.status(401).json({ message: "Session expired" });
    }

    console.log("📦 USER:", decoded.id);

    // ⬇️ products & total frontend mathi aavse
    const { total, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (Number(total) < 30) {
      return res.status(400).json({ message: "Minimum order value is ₹30" });
    }

    const order = await Order.create({
      user: decoded.id,        // ✅ VERY IMPORTANT
      products,
      total,
      orderId: generateId(),  // ✅ model field match
      status: "CREATED"
    });

    console.log("✅ ORDER SAVED:", order._id);

    res.json({
      success: true,
      order
    });

  } catch (err) {
    console.log("❗ SAVE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
