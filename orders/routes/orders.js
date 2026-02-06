import express from "express";
import {
  createOrder,
  getAllOrders,
  updateOrder
} from "../controller/orders/Orders.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", auth, getAllOrders);
router.patch("/:id", auth, updateOrder);

export default router;
