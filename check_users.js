import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8']);
dotenv.config({ path: 'd:/grocerry/server/.env' });

const { Schema } = mongoose;
const UsersSchema = new Schema({
    email: { type: String, lowercase: true, trim: true },
    role: String,
    first_name: String,
}, { collection: 'users' });

const Users = mongoose.model('Users', UsersSchema);

async function checkAdmins() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected.");
        
        const userEmail = 'dhameliyajemish92@gmail.com';
        const user = await Users.findOne({ email: userEmail });
        
        if (user) {
            console.log(`Found User: ${user.email}`);
            console.log(`Current Role: ${user.role}`);
            
            if (user.role !== 'ADMIN') {
                console.log("Promoting to ADMIN...");
                user.role = 'ADMIN';
                await user.save();
                console.log("Promotion successful.");
            } else {
                console.log("User is already an ADMIN.");
            }
        } else {
            console.log(`User ${userEmail} not found in database.`);
            const all = await Users.find().limit(5);
            console.log("Sample users in DB:");
            all.forEach(u => console.log(`- ${u.email} (${u.role})`));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkAdmins();
