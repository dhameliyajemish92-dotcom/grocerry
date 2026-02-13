
import dns from 'dns';
import mongoose from 'mongoose';
import Product from './model/Products.js';
import dotenv from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8']);

const checkCategories = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found in .env");
            return;
        }
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connection successful!");

        console.log("Fetching categories...");
        const categories = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log("Unique categories in database:");
        if (categories.length === 0) {
            console.log("No categories found (collection might be empty)");
        }
        categories.forEach(cat => {
            console.log(` - "${cat._id}": ${cat.count} products`);
        });

        console.log("\nSearching for 'Personal Care' products...");
        const personalCareProducts = await Product.find({ "category": { $regex: "Personal Care", $options: "i" } });
        console.log(`Found ${personalCareProducts.length} products with "Personal Care" (case-insensitive regex)`);

        if (personalCareProducts.length > 0) {
            console.log("Sample product from 'Personal Care':", personalCareProducts[0].name);
        }

    } catch (error) {
        console.error("Error in checkCategories:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

checkCategories();
