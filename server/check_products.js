import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './model/Products.js';

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const allProducts = await Product.find({});
        console.log(`Total products in DB: ${allProducts.length}`);

        if (allProducts.length > 0) {
            console.log("\nFirst 3 products:");
            allProducts.slice(0, 3).forEach((p, i) => {
                console.log(`\n${i + 1}. ID: ${p.product_id || p.id}`);
                console.log(`   Name: ${p.name}`);
                console.log(`   Category: ${p.category}`);
                console.log(`   Price: ${p.price}`);
            });
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
}

checkProducts();
