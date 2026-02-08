
import mongoose from 'mongoose';
import Product from './model/Products.js';
import dotenv from 'dotenv';
import dns from 'dns';
import fs from 'fs';

dotenv.config();

const checkProducts = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("MONGO_URI not found in .env");
            return;
        }

        mongoose.set('strictQuery', false);
        dns.setServers(['8.8.8.8']); // Use Google DNS for MongoDB SRV lookup

        const mongooseOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

        await mongoose.connect(uri, mongooseOptions);

        console.log("Searching for Basmati Rice...");
        const products = await Product.find({ name: { $regex: 'Basmati Rice', $options: 'i' } });

        let output = `Found ${products.length} products with 'Basmati Rice':\n`;
        products.forEach(p => {
            output += "---------------------------------------------------\n";
            output += `ID: ${p.product_id || p.id}\n`;
            output += `Name: ${p.name}\n`;
            output += `Weight (old): '${p.weight}'\n`;
            output += `Measurement (old): '${p.measurement}'\n`;
            output += `Packaging (new): ${JSON.stringify(p.packaging)}\n`;
            output += `Pricing (new): ${JSON.stringify(p.pricing)}\n`;
            output += `Stock (old): ${p.stock}\n`;
            output += `Availability (new): ${JSON.stringify(p.availability)}\n`;
        });

        fs.writeFileSync('db_output.txt', output);
        console.log("Output written to db_output.txt");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkProducts();
