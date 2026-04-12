import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8']);
dotenv.config({ path: 'd:/grocerry/server/.env' });

const { Schema } = mongoose;
const ProductSchema = new Schema({
    id: String,
    stock: { type: Number, default: 0 },
    availability: {
        in_stock: { type: Boolean, default: true }
    }
}, { collection: 'products' });

const Product = mongoose.model('Product', ProductSchema);

async function migrateStock() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected.");
        
        // Find products where stock is missing
        const productsToUpdate = await Product.find({ 
            $or: [
                { stock: { $exists: false } },
                { stock: null }
            ]
        });
        
        console.log(`Found ${productsToUpdate.length} products needing stock initialization.`);

        if (productsToUpdate.length > 0) {
            const result = await Product.updateMany(
                { 
                    $or: [
                        { stock: { $exists: false } },
                        { stock: null }
                    ]
                },
                { 
                    $set: { 
                        stock: 100,
                        "availability.in_stock": true 
                    } 
                }
            );
            console.log(`Migration completed. Modified: ${result.modifiedCount} products.`);
        } else {
            console.log("No products need migration.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration Error:", err);
    }
}

migrateStock();
