import Order from "../../model/Orders.js";
import generateId from "../../utils/generateId.js";



export const createOrder = async (req, res) => {
  try {
    const {
      user,
      products,
      total,
      address,
      orderId,
      payment_method,
      payment_status
    } = req.body;

    if (!user || !products || !total || !address || !orderId || !payment_method) {
      return res.status(400).json({ message: "All fields required" });
    }

    const order = await Order.create({
      user,
      products,
      total,
      address,
      orderId,
      payment_method,
      payment_status: payment_status || "pending",
      status: "pending"
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

