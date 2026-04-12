import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8']);
dotenv.config({ path: 'd:/grocerry/server/.env' });

async function checkRaw() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const products = await db.collection('products').find().limit(5).toArray();
        console.log(JSON.stringify(products, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
checkRaw();
