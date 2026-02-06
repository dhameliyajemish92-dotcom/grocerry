import express from "express";
import auth from "../middleware/auth.js";

import {
  createOrder,
  // getOrder,
  getAllOrders,
  updateOrder
} from "../controller/orders/Orders.js";

const router = express.Router();

router.post("/", auth, createOrder);      // create order (auth added - safer)
// router.get("/:id", auth, getOrder);       
router.get("/", auth, getAllOrders);      
router.patch("/:id", auth, updateOrder);

export default router;
