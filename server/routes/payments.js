import express from "express";
import { createCheckoutSession, webhook, verifyPayment } from "../controller/payments/Payments.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/', auth, createCheckoutSession);
router.post('/verify', auth, verifyPayment);
router.post('/webhook', webhook);

export default router;