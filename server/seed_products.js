import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './model/Products.js';

const sampleProducts = [
    {
        id: "GRN001",
        name: "Organic Basmati Rice",
        brand: "India Gate",
        category: "Grains",
        pricing: { mrp: 350, selling_price: 299 },
        packaging: { quantity: "5", unit: "kg" },
        availability: { in_stock: true },
        image: "/images/grocery/Grains/basmati_rice_grocery_packet_004.jpg"
    },
    {
        id: "GRN002",
        name: "Aashirvaad Atta",
        brand: "Aashirvaad",
        category: "Grains",
        pricing: { mrp: 289, selling_price: 259 },
        packaging: { quantity: "10", unit: "kg" },
        availability: { in_stock: true },
        image: "/images/grocery/Grains/aashirvaad_atta_packet_001.jpg"
    },
    {
        id: "GRN003",
        name: "Moong Dal",
        brand: "Tata",
        category: "Pulses",
        pricing: { mrp: 120, selling_price: 99 },
        packaging: { quantity: "1", unit: "kg" },
        availability: { in_stock: true },
        image: "/images/grocery/Pulses/moong_dal_packet_012.jpg"
    },
    {
        id: "GRN004",
        name: "Toor Dal",
        brand: "Lakshmi",
        category: "Pulses",
        pricing: { mrp: 150, selling_price: 129 },
        packaging: { quantity: "1", unit: "kg" },
        availability: { in_stock: true },
        image: "/images/grocery/Pulses/toor_dal_packet_017.jpg"
    },
    {
        id: "GRN005",
        name: "Sunflower Oil",
        brand: "Saffola",
        category: "Oils",
        pricing: { mrp: 199, selling_price: 169 },
        packaging: { quantity: "1", unit: "L" },
        availability: { in_stock: true },
        image: "/images/grocery/Oils/sunflower_oil_bottle_019.jpg"
    },
    {
        id: "GRN006",
        name: "Fortune Oil",
        brand: "Fortune",
        category: "Oils",
        pricing: { mrp: 189, selling_price: 159 },
        packaging: { quantity: "1", unit: "L" },
        availability: { in_stock: true },
        image: "/images/grocery/Oils/fortune_oil_bottle_008.jpg"
    },
    {
        id: "GRN007",
        name: "Amul Butter",
        brand: "Amul",
        category: "Dairy",
        pricing: { mrp: 60, selling_price: 50 },
        packaging: { quantity: "100", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Dairy/amul_butter_packet_001.jpg"
    },
    {
        id: "GRN008",
        name: "Amul Cheese Slices",
        brand: "Amul",
        category: "Dairy",
        pricing: { mrp: 90, selling_price: 75 },
        packaging: { quantity: "200", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Dairy/amul_cheese_slice_002.jpg"
    },
    {
        id: "GRN009",
        name: "Turmeric Powder",
        brand: "Everest",
        category: "Spices",
        pricing: { mrp: 45, selling_price: 35 },
        packaging: { quantity: "100", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Spices/turmeric_powder_packet_020.jpg"
    },
    {
        id: "GRN010",
        name: "Red Chilli Powder",
        brand: "Everest",
        category: "Spices",
        pricing: { mrp: 45, selling_price: 35 },
        packaging: { quantity: "100", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Spices/red_chilli_powder_packet_018.jpg"
    },
    {
        id: "GRN011",
        name: "Parle-G Biscuit",
        brand: "Parle",
        category: "Snacks",
        pricing: { mrp: 25, selling_price: 20 },
        packaging: { quantity: "800", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Snacks/parle_g_biscuit_packet_013.jpg"
    },
    {
        id: "GRN012",
        name: "Britannia Good Day",
        brand: "Britannia",
        category: "Snacks",
        pricing: { mrp: 35, selling_price: 30 },
        packaging: { quantity: "600", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Snacks/britannia_good_day_biscuit_003.jpg"
    },
    {
        id: "GRN013",
        name: "Green Tea",
        brand: "Tata",
        category: "Beverages",
        pricing: { mrp: 150, selling_price: 120 },
        packaging: { quantity: "100", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Beverages/green_tea_box_010.jpg"
    },
    {
        id: "GRN014",
        name: "Coffee Powder",
        brand: "Nescafe",
        category: "Beverages",
        pricing: { mrp: 280, selling_price: 250 },
        packaging: { quantity: "100", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/Beverages/coffee_powder_jar_003.jpg"
    },
    {
        id: "GRN015",
        name: "Shampoo",
        brand: "Dove",
        category: "PersonalCare",
        pricing: { mrp: 180, selling_price: 150 },
        packaging: { quantity: "180", unit: "ml" },
        availability: { in_stock: true },
        image: "/images/grocery/PersonalCare/shampoo_bottle_015.jpg"
    },
    {
        id: "GRN016",
        name: "Soap Bar",
        brand: "Dove",
        category: "PersonalCare",
        pricing: { mrp: 40, selling_price: 35 },
        packaging: { quantity: "75", unit: "g" },
        availability: { in_stock: true },
        image: "/images/grocery/PersonalCare/soap_bar_packet_017.jpg"
    },
    {
        id: "GRN017",
        name: "Detergent Powder",
        brand: "Surf Excel",
        category: "HomeCare",
        pricing: { mrp: 199, selling_price: 169 },
        packaging: { quantity: "1", unit: "kg" },
        availability: { in_stock: true },
        image: "/images/grocery/HomeCare/detergent_powder_packet_005.jpg"
    },
    {
        id: "GRN018",
        name: "Dishwash Liquid",
        brand: "Vim",
        category: "HomeCare",
        pricing: { mrp: 95, selling_price: 80 },
        packaging: { quantity: "250", unit: "ml" },
        availability: { in_stock: true },
        image: "/images/grocery/HomeCare/dishwash_liquid_bottle_007.jpg"
    },
    {
        id: "GRN019",
        name: "Toilet Cleaner",
        brand: "Harpic",
        category: "HomeCare",
        pricing: { mrp: 150, selling_price: 129 },
        packaging: { quantity: "500", unit: "ml" },
        availability: { in_stock: true },
        image: "/images/grocery/HomeCare/toilet_cleaner_bottle_018.jpg"
    },
    {
        id: "GRN020",
        name: "Amul Milk",
        brand: "Amul",
        category: "Dairy",
        pricing: { mrp: 28, selling_price: 25 },
        packaging: { quantity: "500", unit: "ml" },
        availability: { in_stock: true },
        image: "/images/grocery/Dairy/amul_milk_packet_004.jpg"
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing products
        await Product.deleteMany({});
        console.log("Cleared existing products");

        // Insert sample products
        const inserted = await Product.insertMany(sampleProducts);
        console.log(`Inserted ${inserted.length} products`);

        // Verify
        const count = await Product.countDocuments();
        console.log(`Total products in database: ${count}`);

        // Show first few products
        console.log("\nSample products:");
        inserted.slice(0, 3).forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - ${p.brand} - ₹${p.pricing.selling_price}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
}

seedProducts();
