import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
import Product from './model/Products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseCSV = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) continue;
        
        const product = {};
        headers.forEach((header, index) => {
            product[header.trim()] = values[index].trim();
        });
        products.push(product);
    }
    
    return products;
};

const uploadProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing products
        await Product.deleteMany({});
        console.log("Cleared existing products");

        // Read and parse CSV
        const csvPath = path.join(__dirname, '../client/product-image/products_full.csv');
        const products = parseCSV(csvPath);
        console.log(`Parsed ${products.length} products from CSV`);

        // Transform for database schema
        const dbProducts = products.map(p => ({
            id: p.product_id,
            name: p.name,
            brand: p.name.split(' ')[0], // Use first word as brand
            category: p.category,
            pricing: { 
                mrp: Math.round(parseFloat(p.price) * 1.1), 
                selling_price: parseFloat(p.price) 
            },
            packaging: { 
                quantity: p.weight, 
                unit: p.measurement 
            },
            availability: { in_stock: true },
            image: p.image
        }));

        // Insert products
        const inserted = await Product.insertMany(dbProducts);
        console.log(`Inserted ${inserted.length} products`);

        // Verify
        const count = await Product.countDocuments();
        console.log(`Total products in database: ${count}`);

        // Show sample
        console.log("\nSample products:");
        inserted.slice(0, 5).forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - ${p.category} - ₹${p.pricing.selling_price}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
}

uploadProducts();
