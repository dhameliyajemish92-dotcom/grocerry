import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import dns from 'dns';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import products from "./routes/products.js";
import shipping from "./routes/shipping.js"
import orders from './routes/orders.js';
import payments from './routes/payments.js';
import notifications from "./routes/notifications.js";
import cart from "./routes/cart.js";
import me from "./routes/me.js";
import admin from "./routes/admin.js";
import Stripe from "stripe";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. Senior Diagnostics & Logging ---
console.log("==========================================");
console.log("PRODUCTION STARTUP DIAGNOSTICS");
console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);

import fs from 'fs';
const clientBuildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(clientBuildPath)) {
    console.log("STATUS: Client build folder found.");
} else {
    console.warn("CRITICAL WARNING: Client build folder NOT found at:", clientBuildPath);
}
console.log("==========================================");

// CORS configuration - Senior Excellence
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [/\.onrender\.com$/, /\.vercel\.app$/] // Allow Render/Vercel subdomains
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request Logger (placed above static to catch all traffic)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- 2. External Services ---
export const stripe = process.env.STRIPE_PRIVATE_KEY
    ? Stripe(process.env.STRIPE_PRIVATE_KEY)
    : null;
const storage = multer.memoryStorage();
app.upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- 3. Static Files ---
app.use('/product_downloads', express.static('product_downloads'));
app.use('/images', express.static('../client/public/images/grocery'));
app.use('/Grocery_Images', express.static('../client/product-image/Grocery_Images'));
app.use(express.static(clientBuildPath));

// --- 4. API Routes ---
const apiRouter = express.Router();
apiRouter.use('/orders', orders);
apiRouter.use('/payments', payments);
apiRouter.use('/products', products);
apiRouter.use('/shipping', shipping);
apiRouter.use('/notifications', notifications);
apiRouter.use('/cart', cart);
apiRouter.use('/me', me);
apiRouter.use('/admin', admin);

apiRouter.get('/status', (req, res) => {
    res.status(200).json({
        status: "Online",
        timestamp: new Date().toISOString(),
        team: ["jemish dhameliya", "nakrani takshil"].sort()
    });
});

app.use('/api', apiRouter);

// --- 5. error & Catch-all Handlers ---

// Unmatched API routes
apiRouter.use((req, res) => {
    console.warn(`404: Unmatched API Request: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: "API endpoint not found",
        path: req.originalUrl
    });
});

// Serve React SPA for all non-API routes
app.get('*', (req, res) => {
    if (req.url.startsWith('/api')) return; // Redundancy check
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// --- 6. Server Initialization & Database ---
const PORT = process.env.PORT || 5000;
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.set('strictQuery', false);

// Strict Environment Check
const requiredEnv = [
    'MONGO_URI',
    'JWT_SECRET_KEY',
    'EMAIL_USER',
    'EMAIL_PASS',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length > 0) {
    console.error(`FATAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
    console.error(`Please add these in Render dashboard -> Environment.`);
    process.exit(1);
}

if (!process.env.STRIPE_PRIVATE_KEY) {
    console.warn("WARNING: STRIPE_PRIVATE_KEY is missing. Stripe features will be disabled.");
}

let server;
mongoose.connect(process.env.MONGO_URI, mongooseOptions)
    .then(async () => {
        console.log("Database Connected Successfully");

        // Final Email System Check
        const { verifyTransporter } = await import('./utils/sendEmail.js');
        await verifyTransporter();

        server = app.listen(PORT, () => console.log(`Server executing on port ${PORT}`));
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    });

// --- 7. Graceful Shutdown ---
const gracefulShutdown = (signal) => {
    console.log(`${signal} received: closing HTTP server...`);
    if (server) {
        server.close(async () => {
            console.log('HTTP server closed.');
            await mongoose.connection.close(false);
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
