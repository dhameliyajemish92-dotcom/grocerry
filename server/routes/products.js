import express from "express";
import multer from 'multer';

import {
  PostProducts,
  ShowProductsPerPage,
  productsSearch,
  validateCart,
  adminUpdateProducts,
  ProductsRecommendations,
  getProductsArr,
  updateQuantity,
  uploadProductsFromPDF
} from "../controller/products/Products.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

router.get("/", ShowProductsPerPage);
router.get("/recommendations", ProductsRecommendations);
router.post("/", adminAuth, PostProducts);
router.patch("/", adminAuth, adminUpdateProducts);
router.patch("/updateQuantity", adminAuth, updateQuantity);
router.get("/search", productsSearch);
router.post("/cart", validateCart);
router.post("/arr", getProductsArr);
router.post("/pdf-upload", adminAuth, upload.single('pdf'), uploadProductsFromPDF);

export default router;
