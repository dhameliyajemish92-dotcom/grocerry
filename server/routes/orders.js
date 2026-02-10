import express from "express";

import { createOrder, createOrderCOD, getOrder, getAllOrders, updateOrder, getOrderHistory, createOrderAdmin, sendReceiptEmail } from "../controller/orders/Orders.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post('/', auth, createOrder);
router.post('/admin', adminAuth, createOrderAdmin);
router.post('/cod', auth, (req, res, next) => {
    console.log("Hit /orders/cod route");
    console.log("Full req.body:", req.body);
    console.log("req.body keys:", Object.keys(req.body || {}));
    console.log("req.body type:", typeof req.body);
    console.log("req.headers content-type:", req.headers['content-type']);
    next();
}, createOrderCOD);
router.get('/history', auth, getOrderHistory);
router.post('/:id/send-receipt', auth, sendReceiptEmail);
router.get('/:id', getOrder);
router.get('/', adminAuth, getAllOrders);
router.patch('/:id', adminAuth, updateOrder);

export default router;
