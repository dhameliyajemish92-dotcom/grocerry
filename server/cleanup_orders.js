import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log("Connected to MongoDB");
        const db = mongoose.connection.db;
        
        // Get current indexes
        const indexes = await db.collection('orders').listIndexes().toArray();
        console.log("Current indexes:", indexes.map(i => i.name));
        
        // Drop problematic indexes
        for (const index of indexes) {
            if (index.name !== '_id_') {
                console.log(`Dropping index: ${index.name}`);
                await db.collection('orders').dropIndex(index.name).catch(e => {
                    console.log(`Could not drop ${index.name}:`, e.message);
                });
            }
        }
        
        console.log("✅ Cleanup complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

cleanup();
