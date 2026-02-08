import express from "express";
import dns from 'dns';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import products from "./routes/products.js";
import shipping from "./routes/shipping.js"
import orders from './routes/orders.js';
import payments from './routes/payments.js';
import notifications from "./routes/notifications.js";
import cart from "./routes/cart.js";
// import sgMail from '@sendgrid/mail';
import me from "./routes/me.js";
import Stripe from "stripe";

const app = express();
dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_KEY);
export const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/product_downloads', express.static('product_downloads'));
app.use('/Grocery_Images', express.static('../client/product-image/Grocery_Images'));

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

app.use('/orders', orders);
app.use('/payments', payments);
app.use('/products', products);
app.use('/shipping', shipping);
app.use('/notifications', notifications);
app.use('/cart', cart);
app.use('/me', me);

app.get('/', (req, res) => {
    res.status(200).json({
        team_name: "Curious Monkeys",
        dev_team: ["Baraa A.", "Eman S.", "Sary N.", "Youssef S."].sort()
    })
});

const PORT = process.env.PORT || 5000;

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.set('strictQuery', false);
dns.setServers(['8.8.8.8']); // Use Google DNS for MongoDB SRV lookup
mongoose.connect(process.env.MONGO_URI, mongooseOptions)
    .then(() => {
        app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
        console.log("Database Connected Successfully");
    })
    .catch((error) => console.log("Database connection failed:", error.message));

export default app