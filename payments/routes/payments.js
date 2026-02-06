import express from "express";
import { createCheckoutSession, webhook } from "../controller/payments/Payments.js";

const router = express.Router();

router.post('/', createCheckoutSession);
router.post("/create", createCheckoutSession);


export default router;