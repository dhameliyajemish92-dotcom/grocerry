import express from "express";
import {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    deleteProduct,
    getProduct,
    updateProduct
} from "../controller/admin/Admin.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Dashboard
router.get('/dashboard', adminAuth, getDashboardStats);

// Users Management
router.get('/users', adminAuth, getAllUsers);
router.patch('/users/:userId', adminAuth, updateUserRole);
router.delete('/users/:userId', adminAuth, deleteUser);

// Products Management
router.get('/products/:productId', adminAuth, getProduct);
router.patch('/products/:productId', adminAuth, updateProduct);
router.delete('/products/:productId', adminAuth, deleteProduct);

export default router;
