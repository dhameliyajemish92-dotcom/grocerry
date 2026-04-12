import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8']);
dotenv.config({ path: 'd:/grocerry/server/.env' });

const { Schema } = mongoose;
const ProductSchema = new Schema({
    id: String,
    name: String,
    stock: Number,
    availability: {
        in_stock: Boolean
    }
}, { collection: 'products' });

const Product = mongoose.model('Product', ProductSchema);

async function checkStock() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected.");
        
        const count = await Product.countDocuments();
        console.log(`Total Products: ${count}`);

        const outOfStock = await Product.countDocuments({ 
            $or: [
                { stock: { $lte: 0 } },
                { stock: { $exists: false } },
                { "availability.in_stock": false }
            ]
        });
        console.log(`Products considered Out of Stock: ${outOfStock}`);

        const sample = await Product.find().limit(10);
        console.log("\nStock Details (First 10):");
        sample.forEach(p => {
            console.log(`- ${p.name} (id: ${p.id}): Stock=${p.stock}, InStock=${p.availability?.in_stock}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkStock();
