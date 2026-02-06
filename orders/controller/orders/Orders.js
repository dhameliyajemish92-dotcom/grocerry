import Order from "../../models/order.js";


// ============ CREATE ORDER ============

export const createOrder = async (req, res) => {
  try {
    const { user, products, total, address, orderId } = req.body;

    if (!user || !products || !total || !address || !orderId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const order = new Order({
      user,
      products,
      total,
      address,
      orderId,
      status: "pending"
    });

    await order.save();

    res.status(201).json({ message: "Order saved", order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



// ============ GET ALL ORDERS ============

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============ UPDATE STATUS ============
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
