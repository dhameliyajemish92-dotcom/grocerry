
import mongoose from 'mongoose';
import Product from './server/model/Products.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_URL);

        const categories = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log("Unique categories in database:");
        categories.forEach(cat => {
            console.log(` - "${cat._id}": ${cat.count} products`);
        });

        const personalCareProducts = await Product.find({ "category": { $regex: "Personal Care", $options: "i" } });
        console.log(`\nFound ${personalCareProducts.length} products with "Personal Care" (case-insensitive regex)`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkCategories();
