import express from "express";
import auth from "../middleware/auth.js";
import { login, verifyRole, verifyUser, signup, verifyOtp, forgotPassword, resetPassword } from "../controller/me/Authentication.js";
import { getWishlist, updateWishlist } from "../controller/me/Wishlist.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify', auth, verifyUser);
router.post('/role', verifyRole)

router.get('/wishlist', auth, getWishlist);
router.patch('/wishlist', auth, updateWishlist);

export default router;