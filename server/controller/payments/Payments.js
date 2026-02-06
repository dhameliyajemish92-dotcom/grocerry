import Order from "../../model/order.js";
import generateId from "../../utils/generateId.js";

export const createCheckoutSession = async (req, res) => {
  try {

    console.log("🔥 CHECKOUT API HIT", req.body);

    const { total, products } = req.body;

    if (!total || Number(total) < 30) {
      return res.status(400).json({ message: "Minimum order value is ₹30" });
    }

    const orderId = generateId();   // ✅ camelCase

    const order = await Order.create({
      orderId,
      total,
      status: "CREATED",
      products: products || [],
      ordered_at: new Date()
    });

    console.log("✅ ORDER SAVED:", order._id);

    res.json({
      success: true,
      orderId
    });

  } catch (err) {
    console.log("❗ SAVE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
