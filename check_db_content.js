
import mongoose from 'mongoose';
import Product from './server/model/Products.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_URL);

        console.log("Searching for Basmati Rice...");
        const products = await Product.find({ name: { $regex: 'Basmati Rice', $options: 'i' } });

        console.log(`Found ${products.length} products with 'Basmati Rice':`);
        products.forEach(p => {
            console.log("---------------------------------------------------");
            console.log(`ID: ${p.product_id || p.id}`);
            console.log(`Name: ${p.name}`);
            console.log(`Weight (old): ${p.weight}`);
            console.log(`Measurement (old): ${p.measurement}`);
            console.log(`Packaging (new):`, p.packaging);
            console.log(`Pricing (new):`, p.pricing);
        });

        const allProducts = await Product.find({});
        console.log(`\nTotal products in DB: ${allProducts.length}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkProducts();
