import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Products from './model/Products.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.set('strictQuery', false);
dns.setServers(['8.8.8.8']); // Use Google DNS for MongoDB SRV lookup

// Image Directory Path
const IMAGES_DIR = path.join(__dirname, '../client/product-image/Grocery_Images');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findImageFile(category, keyword) {
    const dirPath = path.join(IMAGES_DIR, category, keyword);
    try {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            // Return the first image file found
            const imageFile = files.find(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
            if (imageFile) {
                return `http://localhost:5000/Grocery_Images/${category}/${keyword}/${imageFile}`;
            }
        }
    } catch (e) {
        // console.log(`Image not found for ${keyword}`);
    }
    // Fallback placeholder
    return "https://via.placeholder.com/150";
}

function extractDetails(keyword) {
    let brand = "Grocery Choice";
    let quantity = "1";
    let unit = "pack";

    const text = keyword.toLowerCase();

    // Detect Brand
    const commonBrands = ["amul", "fortune", "aashirvaad", "saffola", "parle", "britannia", "tata", "maggi", "dabur", "haldiram", "mother dairy", "nestle", "pepsi", "coke", "coca cola", "thums up", "sprite", "lays", "kurkure", "surf excel", "rin", "ariel", "vim", "lizol", "harpic", "dettol", "lifebuoy", "lux", "dove", "pears", "himalaya", "nivea", "vaseline", "ponds", "colgate", "pepsodent", "sensodyne", "close up", "oral-b", "gillette", "whisper", "stayfree", "pampers", "mamy poko", "huggies", "johnson", "dabur", "patanjali"];

    for (const b of commonBrands) {
        if (text.includes(b)) {
            brand = b.charAt(0).toUpperCase() + b.slice(1);
            break;
        }
    }

    // Detect Unit and Quantity
    // Regex for "5 kg", "500 ml", "1 litre", etc.
    const unitRegex = /(\d+(?:\.\d+)?)\s*(kg|g|gm|l|ml|ltr|liter|litre|pcs|pack|packet|bottle|can|jar|box|tube)/i;
    const match = text.match(unitRegex);

    if (match) {
        quantity = match[1];
        let u = match[2].toLowerCase();
        // Normalize units
        if (u === 'gm') unit = 'g';
        else if (u === 'ltr' || u === 'liter' || u === 'litre') unit = 'l';
        else unit = u;
    } else {
        // Infer unit from keyword type if no number found
        if (text.includes("oil") || text.includes("shampoo") || text.includes("drink") || text.includes("milk") || text.includes("juice")) {
            if (text.includes("bottle")) unit = "bottle";
            else unit = "l";
        } else if (text.includes("rice") || text.includes("flour") || text.includes("atta") || text.includes("sugar") || text.includes("dal")) {
            unit = "kg";
        } else if (text.includes("packet")) {
            unit = "pack";
        }
    }

    return { brand, quantity, unit };
}

// CSV Path matches the location in client/product-image/product.csv from server/ directory
const CSV_PATH = path.join(__dirname, '../client/product-image/product.csv');

function parseCSV(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const products = [];

        // Skip header (line 0)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Assuming format: category,keyword
            // Handle potential commas within quotes if complex, but simple split might work for this simple CSV
            const parts = line.split(',');
            if (parts.length < 2) continue;

            const category = parts[0].trim();
            const keyword = parts.slice(1).join(',').trim(); // Join back in case keyword has commas

            if (!category || !keyword) continue;

            products.push({ category, keyword });
        }
        return products;
    } catch (error) {
        console.error("Error parsing CSV:", error);
        return [];
    }
}

async function seedProducts() {
    console.log("Reading CSV...");
    const csvData = parseCSV(CSV_PATH);
    console.log(`Found ${csvData.length} products in CSV.`);

    if (csvData.length === 0) {
        console.log("No products found to seed. Exiting.");
        return;
    }

    const productsToInsert = csvData.map(item => {
        const price = getRandomInt(40, 500);
        const mrp = Math.floor(price * 1.2);

        const imagePath = findImageFile(item.category, item.keyword);
        const details = extractDetails(item.keyword);

        return {
            id: new mongoose.Types.ObjectId().toString(),
            name: item.keyword,
            brand: details.brand,
            category: item.category,
            pricing: {
                mrp: mrp,
                selling_price: price
            },
            packaging: {
                quantity: details.quantity,
                unit: details.unit
            },
            availability: {
                in_stock: true
            },
            image: imagePath
        };
    });

    console.log("Connecting to Database...");
    try {
        await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
        console.log("Database Connected Successfully");

        console.log("Clearing existing products...");
        await Products.deleteMany({});
        console.log("Cleared.");

        console.log(`Inserting ${productsToInsert.length} new products...`);
        await Products.insertMany(productsToInsert);

        console.log("Seed Completed Successfully!");
    } catch (error) {
        console.error("Seeding Error:", error);
    } finally {
        mongoose.disconnect();
        console.log("Disconnected.");
    }
}

seedProducts();
