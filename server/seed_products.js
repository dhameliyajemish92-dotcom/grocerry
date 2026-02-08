import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Products from './model/Products.js';
import fs from 'fs';

dotenv.config();

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.set('strictQuery', false);

console.log("Reading bb_products.json...");
let products = [];
try {
    const data = fs.readFileSync('bb_products.json', 'utf8');
    products = JSON.parse(data);
    console.log(`Loaded ${products.length} products from bb_products.json`);
} catch (e) {
    console.error("Error loading bb_products.json:", e.message);
    process.exit(1);
}

// Map and clean products
const cleanProducts = products.map(p => {
    let weight = p.weight;
    let measurement = p.measurement;

    // Fallback if measurement is empty but weight implies units
    if (!measurement) {
        measurement = "unit";
    }

    // Ensure price is a number
    let price = parseFloat(p.price);
    if (isNaN(price)) price = 0;

    // Ensure weight is a number
    weight = parseFloat(weight);
    if (isNaN(weight)) weight = 0;

    return {
        product_id: p.product_id || new mongoose.Types.ObjectId().toString(),
        name: p.name,
        price: price,
        weight: weight,
        measurement: measurement,
        category: p.category,
        image: p.image || "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/lqcm8z8qwhi42efm2lue",
        stock: p.stock || 50
    };
});

console.log("Connecting to Database...");
mongoose.connect(process.env.MONGO_URI, mongooseOptions)
    .then(async () => {
        console.log("Database Connected Successfully");
        try {
            console.log("Clearing existing products...");
            await Products.deleteMany({});
            console.log("Cleared.");

            console.log(`Inserting ${cleanProducts.length} new products...`);
            // Insert in batches to be safe, though insertMany handles it well
            await Products.insertMany(cleanProducts);

            console.log("Seed Completed Successfully!");
        } catch (error) {
            console.error("Seeding Error:", error);
        } finally {
            mongoose.disconnect();
            console.log("Disconnected.");
        }
    })
    .catch((error) => console.log("Database connection failed:", error.message));
