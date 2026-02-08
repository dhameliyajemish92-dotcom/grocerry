import express from "express";

import { createOrder, createOrderCOD, getOrder, getAllOrders, updateOrder, getOrderHistory } from "../controller/orders/Orders.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/', auth, createOrder);
router.post('/cod', auth, (req, res, next) => {
    console.log("Hit /orders/cod route");
    next();
}, createOrderCOD);
router.get('/history', auth, getOrderHistory);
router.get('/:id', getOrder);
router.get('/', auth, getAllOrders);
router.patch('/:id', auth, updateOrder);

export default router;
