import express from "express";
import { createCheckoutSession } from "../controller/payments/Payments.js";

const router = express.Router();

router.post("/create", createCheckoutSession);

export default router;

