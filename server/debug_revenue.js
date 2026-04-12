import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './model/Orders.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const orders = await Order.find();
        console.log(`Total orders found: ${orders.length}`);

        if (orders.length > 0) {
            console.log("Sample Order Total and Status:");
            orders.forEach(o => {
                console.log(`ID: ${o.order_id}, Total: ${o.total}, Status: ${o.status}`);
            });

            const totalRevenue = orders
                .filter(o => o.status !== 'CANCELLED')
                .reduce((sum, o) => sum + (o.total || 0), 0);
            
            console.log(`Calculated Revenue (excluding CANCELLED): ${totalRevenue}`);
        } else {
            console.log("No orders found in database.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkDB();
