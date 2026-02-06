import express from "express";
import auth from "../middleware/auth.js";

import {
  signup,
  login,
  verifyOTP,          // ✅ ADD THIS
  forgotPassword,
  resetPassword
} from "../controller/me/Authentication.js";

import { getWishlist, updateWishlist } from "../controller/me/Wishlist.js";

const router = express.Router();

/* ========= AUTH ========= */

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);   // ✅ ADD THIS
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* ========= WISHLIST ========= */

router.get("/wishlist", auth, getWishlist);
router.patch("/wishlist", auth, updateWishlist);

export default router;
