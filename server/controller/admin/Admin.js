import Products from '../../model/Products.js';
import Order from '../../model/Orders.js';
import Shipments from '../../model/Shipments.js';
import Users from '../../model/Users.js';

/**
 * Admin Dashboard - Get Statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalProducts = await Products.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalShipments = await Shipments.countDocuments();
        const totalUsers = await Users.countDocuments();

        // Get revenue from completed orders
        const completedOrders = await Order.find({ status: 'DELIVERED' });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Get recent orders (last 5)
        const recentOrders = await Order.find()
            .sort({ ordered_at: -1 })
            .limit(5)
            .select('order_id total status ordered_at');

        // Get orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get low stock products (less than 10 items)
        const lowStockProducts = await Products.find({
            $expr: { $lt: ['$stock', 10] }
        })
            .limit(10)
            .select('id name stock');

        res.status(200).json({
            stats: {
                totalProducts,
                totalOrders,
                totalShipments,
                totalUsers,
                totalRevenue: totalRevenue.toFixed(2),
            },
            recentOrders,
            ordersByStatus,
            lowStockProducts
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Get All Users
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find()
            .select('-password -otp -otpExpires')
            .sort({ _id: -1 });

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Update User Role
 */
export const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be USER or ADMIN" });
        }

        const user = await Users.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password -otp -otpExpires');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Delete User
 */
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await Users.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Delete Product
 */
export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Products.findOneAndDelete({ id: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Get Single Product
 */
export const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Products.findOne({ id: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Update Product
 */
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        const product = await Products.findOneAndUpdate(
            { id: productId },
            updateData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
