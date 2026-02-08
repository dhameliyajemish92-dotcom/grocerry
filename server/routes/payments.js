import express from "express";
import { createCheckoutSession, webhook } from "../controller/payments/Payments.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/', auth, createCheckoutSession);
router.post('/webhook', webhook);

export default router;