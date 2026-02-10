import express from "express";

import {
  PostProducts,
  ShowProductsPerPage,
  productsSearch,
  validateCart,
  adminUpdateProducts,
  ProductsRecommendations,
  getProductsArr,
  updateQuantity
} from "../controller/products/Products.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", ShowProductsPerPage);
router.get("/recommendations", ProductsRecommendations);
router.post("/", adminAuth, PostProducts);
router.patch("/", adminAuth, adminUpdateProducts);
router.patch("/updateQuantity", adminAuth, updateQuantity);
router.get("/search", productsSearch);
router.post("/cart", validateCart);
router.post("/arr", getProductsArr);

export default router;
