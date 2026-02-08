import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Products from './model/Products.js';
import dns from 'dns';

dotenv.config();

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.set('strictQuery', false);
dns.setServers(['8.8.8.8']);

async function checkProducts() {
    console.log("Connecting to Database...");
    try {
        await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
        console.log("Connected.");

        const count = await Products.countDocuments();
        console.log(`Total Products in DB: ${count}`);

        if (count > 0) {
            const sample = await Products.findOne();
            console.log("Sample Product:");
            console.log("Name:", sample.name);
            console.log("Brand:", sample.brand);
            console.log("Packaging:", sample.packaging);
            console.log("Image:", sample.image);
        } else {
            console.log("No products found!");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.disconnect();
    }
}

checkProducts();
