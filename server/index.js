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
// sgMail.setApiKey(process.env.SENDGRID_KEY);
export const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Make upload available to routes
app.upload = upload;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/product_downloads', express.static('product_downloads'));
app.use('/images', express.static('../client/public/images/grocery'));
app.use('/Grocery_Images', express.static('../client/product-image/Grocery_Images'));

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Serve Static Files for Production
app.use(express.static(path.join(__dirname, '../client/build')));

const apiRouter = express.Router();

apiRouter.use('/orders', orders);
apiRouter.use('/payments', payments);
apiRouter.use('/products', products);
apiRouter.use('/shipping', shipping);
apiRouter.use('/notifications', notifications);
apiRouter.use('/cart', cart);
apiRouter.use('/me', me);
apiRouter.use('/admin', admin);

app.use('/api', apiRouter);

apiRouter.get('/status', (req, res) => {
    res.status(200).json({
        team_name: "project",
        dev_team: ["jemish dhameliya", "nakrani takshil"].sort()
    })
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.set('strictQuery', false);
dns.setServers(['8.8.8.8']); // Use Google DNS for MongoDB SRV lookup
if (!process.env.MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in environment variables.");
    process.exit(1);
}
mongoose.connect(process.env.MONGO_URI, mongooseOptions)
    .then(() => {
        app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
        console.log("Database Connected Successfully");
    })
    .catch((error) => console.log("Database connection failed:", error.message));

export default app