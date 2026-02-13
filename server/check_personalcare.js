import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './model/Products.js';

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Count all products
        const total = await Product.countDocuments();
        console.log(`Total products: ${total}`);

        // Count PersonalCare products (case-insensitive)
        const personalCare = await Product.find({ 
            category: { $regex: /personalcare/i } 
        });
        console.log(`PersonalCare products: ${personalCare.length}`);
        if (personalCare.length > 0) {
            console.log("\nPersonalCare products:");
            personalCare.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name} - ${p.category} - ₹${p.pricing?.selling_price || p.price}`);
            });
        }

        // List all categories
        const categories = await Product.distinct('category');
        console.log("\nAll categories:");
        console.log(categories);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
}

checkProducts();
