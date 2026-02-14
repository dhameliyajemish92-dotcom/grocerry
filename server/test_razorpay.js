import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

console.log("--- START DIAGNOSTIC ---");
console.log("Package imported:", !!Razorpay);
console.log("Type of Razorpay:", typeof Razorpay);

async function run() {
    try {
        console.log("Initializing Razorpay...");
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log("Instance created:", !!instance);

        console.log("Creating order...");
        const order = await instance.orders.create({
            amount: 100,
            currency: "INR",
            receipt: "test_" + Date.now()
        });
        console.log("Order created:", order.id);
    } catch (e) {
        console.log("ERROR IN RUN:", e.message);
        console.log("FULL ERROR:", e);
    }
}

run().then(() => console.log("--- END DIAGNOSTIC ---"));
