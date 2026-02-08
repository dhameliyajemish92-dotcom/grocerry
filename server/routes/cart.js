import express from "express";
import auth from "../middleware/auth.js";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../controller/cart/Cart.js";

const router = express.Router();

router.get('/', auth, getCart);
router.post('/', auth, addToCart);
router.patch('/', auth, updateCartItem);
router.delete('/', auth, removeFromCart);

export default router;
