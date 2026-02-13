import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './model/Products.js';

// Products based on actual image filenames in client/build/images/grocery/
const productsData = [
    // Beverages (Images: 001-020)
    { name: "Black Tea Packet", brand: "Lipton", category: "Beverages", price: 120, weight: "250", unit: "g", img_suffix: "001" },
    { name: "Coconut Water Bottle", brand: "Coco", category: "Beverages", price: 55, weight: "250", unit: "ml", img_suffix: "002" },
    { name: "Coffee Powder Jar", brand: "Nescafe", category: "Beverages", price: 250, weight: "100", unit: "g", img_suffix: "003" },
    { name: "Cold Coffee Bottle", brand: "Cafe", category: "Beverages", price: 55, weight: "250", unit: "ml", img_suffix: "004" },
    { name: "Energy Drink Can", brand: "Red Bull", category: "Beverages", price: 125, weight: "250", unit: "ml", img_suffix: "005" },
    { name: "Filter Coffee Powder", brand: "Nescafe", category: "Beverages", price: 180, weight: "100", unit: "g", img_suffix: "006" },
    { name: "Flavoured Water Bottle", brand: "Kinley", category: "Beverages", price: 20, weight: "500", unit: "ml", img_suffix: "007" },
    { name: "Fruit Juice Tetra Pack", brand: "Tropicana", category: "Beverages", price: 75, weight: "1", unit: "L", img_suffix: "008" },
    { name: "Fruit Squash Bottle", brand: "Rasna", category: "Beverages", price: 85, weight: "750", unit: "ml", img_suffix: "009" },
    { name: "Green Tea Box", brand: "Tata", category: "Beverages", price: 150, weight: "100", unit: "g", img_suffix: "010" },
    { name: "Health Drink Powder", brand: "Boost", category: "Beverages", price: 299, weight: "500", unit: "g", img_suffix: "011" },
    { name: "Herbal Tea Box", brand: "Lipton", category: "Beverages", price: 140, weight: "100", unit: "g", img_suffix: "012" },
    { name: "Hot Chocolate Powder", brand: "Cadbury", category: "Beverages", price: 120, weight: "250", unit: "g", img_suffix: "013" },
    { name: "Iced Tea Bottle", brand: "Nestea", category: "Beverages", price: 45, weight: "300", unit: "ml", img_suffix: "014" },
    { name: "Instant Coffee Sachet", brand: "Nescafe", category: "Beverages", price: 15, weight: "1", unit: "g", img_suffix: "015" },
    { name: "Lemon Drink Bottle", brand: "Slice", category: "Beverages", price: 35, weight: "250", unit: "ml", img_suffix: "016" },
    { name: "Milkshake Bottle", brand: "Amul", category: "Beverages", price: 30, weight: "250", unit: "ml", img_suffix: "017" },
    { name: "Protein Drink Bottle", brand: "Whey", category: "Beverages", price: 350, weight: "450", unit: "ml", img_suffix: "018" },
    { name: "Soft Drink Bottle", brand: "Coca Cola", category: "Beverages", price: 40, weight: "500", unit: "ml", img_suffix: "019" },
    { name: "Tea Powder Packet", brand: "Tata", category: "Beverages", price: 120, weight: "250", unit: "g", img_suffix: "020" },

    // Dairy (Images: 001-020)
    { name: "Amul Butter Packet", brand: "Amul", category: "Dairy", price: 50, weight: "100", unit: "g", img_suffix: "001" },
    { name: "Amul Cheese Slice", brand: "Amul", category: "Dairy", price: 75, weight: "200", unit: "g", img_suffix: "002" },
    { name: "Amul Ghee Jar", brand: "Amul", category: "Dairy", price: 450, weight: "500", unit: "g", img_suffix: "003" },
    { name: "Amul Milk Packet", brand: "Amul", category: "Dairy", price: 25, weight: "500", unit: "ml", img_suffix: "004" },
    { name: "Butter Milk Tetra Pack", brand: "Amul", category: "Dairy", price: 25, weight: "250", unit: "ml", img_suffix: "005" },
    { name: "Buttermilk Packet", brand: "Amul", category: "Dairy", price: 20, weight: "250", unit: "ml", img_suffix: "006" },
    { name: "Cheese Block Packet", brand: "Amul", category: "Dairy", price: 145, weight: "400", unit: "g", img_suffix: "007" },
    { name: "Cheese Spread Jar", brand: "Amul", category: "Dairy", price: 110, weight: "200", unit: "g", img_suffix: "008" },
    { name: "Condensed Milk Tin", brand: "Amul", category: "Dairy", price: 95, weight: "400", unit: "g", img_suffix: "009" },
    { name: "Cream Packet", brand: "Amul", category: "Dairy", price: 65, weight: "200", unit: "ml", img_suffix: "010" },
    { name: "Curd Dahi Cup", brand: "Amul", category: "Dairy", price: 25, weight: "200", unit: "g", img_suffix: "011" },
    { name: "Flavoured Milk Bottle", brand: "Amul", category: "Dairy", price: 35, weight: "250", unit: "ml", img_suffix: "012" },
    { name: "Fresh Cream Pack", brand: "Amul", category: "Dairy", price: 75, weight: "250", unit: "ml", img_suffix: "013" },
    { name: "Full Cream Milk Packet", brand: "Amul", category: "Dairy", price: 28, weight: "500", unit: "ml", img_suffix: "014" },
    { name: "Khoya Mawa Packet", brand: "Mohan", category: "Dairy", price: 160, weight: "400", unit: "g", img_suffix: "015" },
    { name: "Lassi Bottle", brand: "Amul", category: "Dairy", price: 45, weight: "300", unit: "ml", img_suffix: "016" },
    { name: "Paneer Packet", brand: "Amul", category: "Dairy", price: 120, weight: "200", unit: "g", img_suffix: "017" },
    { name: "Skimmed Milk Packet", brand: "Amul", category: "Dairy", price: 22, weight: "500", unit: "ml", img_suffix: "018" },
    { name: "Whipping Cream Pack", brand: "Amul", category: "Dairy", price: 85, weight: "250", unit: "ml", img_suffix: "019" },
    { name: "Yogurt Cup", brand: "Nestle", category: "Dairy", price: 35, weight: "150", unit: "g", img_suffix: "020" },

    // Grains (Images: 001-018)
    { name: "Aashirvaad Atta Packet", brand: "Aashirvaad", category: "Grains", price: 259, weight: "10", unit: "kg", img_suffix: "001" },
    { name: "Bajra Flour Packet", brand: "Organic", category: "Grains", price: 75, weight: "1", unit: "kg", img_suffix: "002" },
    { name: "Barley Packet", brand: "Organic", category: "Grains", price: 95, weight: "500", unit: "g", img_suffix: "003" },
    { name: "Basmati Rice Grocery Packet", brand: "India Gate", category: "Grains", price: 299, weight: "5", unit: "kg", img_suffix: "004" },
    { name: "Brown Rice Packet", brand: "Tata", category: "Grains", price: 249, weight: "1", unit: "kg", img_suffix: "005" },
    { name: "Corn Flour Packet", brand: "Tops", category: "Grains", price: 55, weight: "500", unit: "g", img_suffix: "006" },
    { name: "Dosa Rice Packet", brand: "Ponni", category: "Grains", price: 110, weight: "2", unit: "kg", img_suffix: "007" },
    { name: "Idli Rice Packet", brand: "Sona", category: "Grains", price: 120, weight: "2", unit: "kg", img_suffix: "008" },
    { name: "Jowar Flour Packet", brand: "Organic", category: "Grains", price: 85, weight: "1", unit: "kg", img_suffix: "009" },
    { name: "Long Grain Rice Packet", brand: "Royal", category: "Grains", price: 199, weight: "5", unit: "kg", img_suffix: "010" },
    { name: "Maida Flour Packet", brand: "Ashirvaad", category: "Grains", price: 80, weight: "1", unit: "kg", img_suffix: "011" },
    { name: "Oats Packet", brand: "Quaker", category: "Grains", price: 189, weight: "500", unit: "g", img_suffix: "012" },
    { name: "Organic Rice Packet", brand: "True Elements", category: "Grains", price: 299, weight: "1", unit: "kg", img_suffix: "013" },
    { name: "Quinoa Packet", brand: "True Elements", category: "Grains", price: 350, weight: "500", unit: "g", img_suffix: "014" },
    { name: "Rava Sooji Packet", brand: "MTR", category: "Grains", price: 65, weight: "500", unit: "g", img_suffix: "015" },
    { name: "Short Grain Rice Packet", brand: "Daawat", category: "Grains", price: 189, weight: "5", unit: "kg", img_suffix: "016" },
    { name: "Wheat Flour Atta Packet", brand: "Fortune", category: "Grains", price: 199, weight: "10", unit: "kg", img_suffix: "017" },
    { name: "Whole Wheat Grain", brand: "Shakti Bhog", category: "Grains", price: 150, weight: "5", unit: "kg", img_suffix: "018" },

    // Pulses (Images: 001-020)
    { name: "Black Chana Packet", brand: "Tata", category: "Pulses", price: 95, weight: "1", unit: "kg", img_suffix: "001" },
    { name: "Chana Dal Packet", brand: "Lakshmi", category: "Pulses", price: 89, weight: "1", unit: "kg", img_suffix: "002" },
    { name: "Chickpeas Packet", brand: "Desi", category: "Pulses", price: 99, weight: "1", unit: "kg", img_suffix: "003" },
    { name: "Green Peas Packet", brand: "Farm Fresh", category: "Pulses", price: 75, weight: "500", unit: "g", img_suffix: "004" },
    { name: "Horse Gram Packet", brand: "Organic", category: "Pulses", price: 79, weight: "500", unit: "g", img_suffix: "005" },
    { name: "Kabuli Chana Packet", brand: "Tasty", category: "Pulses", price: 169, weight: "1", unit: "kg", img_suffix: "006" },
    { name: "Kidney Beans Packet", brand: "Kohinoor", category: "Pulses", price: 149, weight: "1", unit: "kg", img_suffix: "007" },
    { name: "Lentils Mix Packet", brand: "Everest", category: "Pulses", price: 109, weight: "1", unit: "kg", img_suffix: "008" },
    { name: "Lobia Black Eyed Beans", brand: "Vedaka", category: "Pulses", price: 95, weight: "500", unit: "g", img_suffix: "009" },
    { name: "Masoor Dal Packet", brand: "Tata", category: "Pulses", price: 95, weight: "1", unit: "kg", img_suffix: "010" },
    { name: "Masoor Whole Packet", brand: "Tata", category: "Pulses", price: 90, weight: "1", unit: "kg", img_suffix: "011" },
    { name: "Moong Dal Packet", brand: "Lakshmi", category: "Pulses", price: 99, weight: "1", unit: "kg", img_suffix: "012" },
    { name: "Moong Whole Packet", brand: "Tata", category: "Pulses", price: 89, weight: "1", unit: "kg", img_suffix: "013" },
    { name: "Moth Beans Packet", brand: "Desi", category: "Pulses", price: 75, weight: "500", unit: "g", img_suffix: "014" },
    { name: "Rajma Packet", brand: "Kohinoor", category: "Pulses", price: 139, weight: "1", unit: "kg", img_suffix: "015" },
    { name: "Soybean Packet", brand: "Nutrela", category: "Pulses", price: 85, weight: "500", unit: "g", img_suffix: "016" },
    { name: "Toor Dal Packet", brand: "Tata", category: "Pulses", price: 129, weight: "1", unit: "kg", img_suffix: "017" },
    { name: "Urad Dal Packet", brand: "Premium", category: "Pulses", price: 119, weight: "1", unit: "kg", img_suffix: "018" },
    { name: "Urad Whole Packet", brand: "Tata", category: "Pulses", price: 115, weight: "1", unit: "kg", img_suffix: "019" },
    { name: "White Peas Packet", brand: "Farm Fresh", category: "Pulses", price: 69, weight: "500", unit: "g", img_suffix: "020" },

    // Oils (Images: 001-020)
    { name: "Blended Oil Bottle", brand: "Emami", category: "Oils", price: 159, weight: "1", unit: "L", img_suffix: "001" },
    { name: "Canola Oil Bottle", brand: "Sunflower", category: "Oils", price: 199, weight: "1", unit: "L", img_suffix: "002" },
    { name: "Coconut Oil Bottle", brand: "Parachute", category: "Oils", price: 199, weight: "500", unit: "ml", img_suffix: "003" },
    { name: "Cold Pressed Oil Bottle", brand: "Kohinoor", category: "Oils", price: 299, weight: "500", unit: "ml", img_suffix: "004" },
    { name: "Cooking Oil Pouch", brand: "Fortune", category: "Oils", price: 149, weight: "1", unit: "L", img_suffix: "005" },
    { name: "Corn Oil Bottle", brand: "Mazola", category: "Oils", price: 189, weight: "1", unit: "L", img_suffix: "006" },
    { name: "Extra Virgin Olive Oil", brand: "Figaro", category: "Oils", price: 399, weight: "500", unit: "ml", img_suffix: "007" },
    { name: "Fortune Oil Bottle", brand: "Fortune", price: 159, weight: "1", unit: "L", category: "Oils", img_suffix: "008" },
    { name: "Gingelly Oil Bottle", brand: "Adya", category: "Oils", price: 229, weight: "500", unit: "ml", img_suffix: "009" },
    { name: "Groundnut Oil Bottle", brand: "Dalda", category: "Oils", price: 189, weight: "1", unit: "L", img_suffix: "010" },
    { name: "Mustard Oil Bottle", brand: "Fortune", category: "Oils", price: 149, weight: "1", unit: "L", img_suffix: "011" },
    { name: "Olive Oil Bottle", brand: "Borges", category: "Oils", price: 549, weight: "500", unit: "ml", img_suffix: "012" },
    { name: "Organic Oil Bottle", brand: "True Elements", category: "Oils", price: 299, weight: "500", unit: "ml", img_suffix: "013" },
    { name: "Palm Oil Bottle", brand: "Gold Winner", category: "Oils", price: 129, weight: "1", unit: "L", img_suffix: "014" },
    { name: "Refined Oil Bottle", brand: "Fortune", category: "Oils", price: 149, weight: "1", unit: "L", img_suffix: "015" },
    { name: "Rice Bran Oil Bottle", brand: "Saffola", category: "Oils", price: 179, weight: "1", unit: "L", img_suffix: "016" },
    { name: "Saffola Oil Bottle", brand: "Saffola", category: "Oils", price: 169, weight: "1", unit: "L", img_suffix: "017" },
    { name: "Soybean Oil Bottle", brand: "Vijaya", category: "Oils", price: 139, weight: "1", unit: "L", img_suffix: "018" },
    { name: "Sunflower Oil Bottle", brand: "Saffola", category: "Oils", price: 169, weight: "1", unit: "L", img_suffix: "019" },
    { name: "Vegetable Oil Bottle", brand: "Dalda", category: "Oils", price: 139, weight: "1", unit: "L", img_suffix: "020" },

    // Spices (Images: 001-020)
    { name: "Asafoetida Hing", brand: "Everest", category: "Spices", price: 35, weight: "25", unit: "g", img_suffix: "001" },
    { name: "Bay Leaf Tej Patta", brand: "Everest", category: "Spices", price: 20, weight: "25", unit: "g", img_suffix: "002" },
    { name: "Black Pepper Whole", brand: "Everest", category: "Spices", price: 45, weight: "50", unit: "g", img_suffix: "003" },
    { name: "Chat Masala Packet", brand: "Everest", category: "Spices", price: 32, weight: "100", unit: "g", img_suffix: "004" },
    { name: "Chicken Masala", brand: "Everest", category: "Spices", price: 42, weight: "100", unit: "g", img_suffix: "005" },
    { name: "Cinnamon Sticks", brand: "Everest", category: "Spices", price: 35, weight: "50", unit: "g", img_suffix: "006" },
    { name: "Cloves Laung", brand: "Everest", category: "Spices", price: 40, weight: "25", unit: "g", img_suffix: "007" },
    { name: "Coriander Powder Packet", brand: "Everest", category: "Spices", price: 32, weight: "100", unit: "g", img_suffix: "008" },
    { name: "Cumin Seeds Jeera", brand: "Everest", category: "Spices", price: 30, weight: "50", unit: "g", img_suffix: "009" },
    { name: "Fennel Seeds Saunf", brand: "Everest", category: "Spices", price: 28, weight: "50", unit: "g", img_suffix: "010" },
    { name: "Garam Masala Packet", brand: "Everest", category: "Spices", price: 45, weight: "100", unit: "g", img_suffix: "011" },
    { name: "Green Cardamom", brand: "Everest", category: "Spices", price: 55, weight: "25", unit: "g", img_suffix: "012" },
    { name: "Kitchen King Masala", brand: "Everest", category: "Spices", price: 40, weight: "100", unit: "g", img_suffix: "013" },
    { name: "Meat Masala", brand: "Everest", category: "Spices", price: 40, weight: "100", unit: "g", img_suffix: "014" },
    { name: "Mustard Seeds Rai", brand: "Everest", category: "Spices", price: 25, weight: "50", unit: "g", img_suffix: "015" },
    { name: "Pav Bhaji Masala", brand: "Everest", category: "Spices", price: 32, weight: "100", unit: "g", img_suffix: "016" },
    { name: "Rasam Powder", brand: "Everest", category: "Spices", price: 35, weight: "100", unit: "g", img_suffix: "017" },
    { name: "Red Chilli Powder Packet", brand: "Everest", category: "Spices", price: 35, weight: "100", unit: "g", img_suffix: "018" },
    { name: "Sambar Masala", brand: "Everest", category: "Spices", price: 38, weight: "100", unit: "g", img_suffix: "019" },
    { name: "Turmeric Powder Packet", brand: "Everest", category: "Spices", price: 35, weight: "100", unit: "g", img_suffix: "020" },

    // Snacks (Images: 001-020)
    { name: "Aloo Bhujia Packet", brand: "Haldiram's", category: "Snacks", price: 30, weight: "200", unit: "g", img_suffix: "001" },
    { name: "Banana Chips Packet", brand: "Balaji", category: "Snacks", price: 45, weight: "200", unit: "g", img_suffix: "002" },
    { name: "Britannia Good Day Biscuit", brand: "Britannia", category: "Snacks", price: 30, weight: "600", unit: "g", img_suffix: "003" },
    { name: "Cheese Balls Snack", brand: "Kurkure", category: "Snacks", price: 20, weight: "50", unit: "g", img_suffix: "004" },
    { name: "Cream Biscuit Packet", brand: "Parle", category: "Snacks", price: 35, weight: "500", unit: "g", img_suffix: "005" },
    { name: "Khakhra Packet", brand: "Lijjat", category: "Snacks", price: 50, weight: "300", unit: "g", img_suffix: "006" },
    { name: "Kurkure Packet", brand: "Kurkure", category: "Snacks", price: 20, weight: "60", unit: "g", img_suffix: "007" },
    { name: "Makhana Fox Nuts", brand: "Tata", category: "Snacks", price: 85, weight: "200", unit: "g", img_suffix: "008" },
    { name: "Marie Biscuit Packet", brand: "Britannia", category: "Snacks", price: 25, weight: "700", unit: "g", img_suffix: "009" },
    { name: "Mathri Packet", brand: "Bikanervala", category: "Snacks", price: 35, weight: "250", unit: "g", img_suffix: "010" },
    { name: "Namkeen Mixture Packet", brand: "Bikanervala", category: "Snacks", price: 40, weight: "200", unit: "g", img_suffix: "011" },
    { name: "Namkeen Sev Packet", brand: "Haldiram's", category: "Snacks", price: 25, weight: "150", unit: "g", img_suffix: "012" },
    { name: "Parle G Biscuit Packet", brand: "Parle", category: "Snacks", price: 20, weight: "800", unit: "g", img_suffix: "013" },
    { name: "Peanut Chikki", brand: "Mohan", category: "Snacks", price: 35, weight: "150", unit: "g", img_suffix: "014" },
    { name: "Popcorn Packet", brand: "Act II", category: "Snacks", price: 25, weight: "100", unit: "g", img_suffix: "015" },
    { name: "Potato Chips Packet", brand: "Lays", category: "Snacks", price: 20, weight: "50", unit: "g", img_suffix: "016" },
    { name: "Roasted Peanuts Packet", brand: "Tata", category: "Snacks", price: 55, weight: "200", unit: "g", img_suffix: "017" },
    { name: "Salted Cashews", brand: "Tata", category: "Snacks", price: 145, weight: "200", unit: "g", img_suffix: "018" },
    { name: "Sev Bhujia Packet", brand: "Haldiram's", category: "Snacks", price: 30, weight: "200", unit: "g", img_suffix: "019" },
    { name: "Tortilla Chips Packet", brand: "Doritos", category: "Snacks", price: 45, weight: "150", unit: "g", img_suffix: "020" },

    // Home Care (Images: 001-020)
    { name: "Air Freshener Refill", brand: "Glade", category: "Home Care", price: 85, weight: "270", unit: "ml", img_suffix: "001" },
    { name: "Bleach Liquid Bottle", brand: "Clorox", category: "Home Care", price: 95, weight: "500", unit: "ml", img_suffix: "002" },
    { name: "Cleaning Gloves", brand: "Victory", category: "Home Care", price: 75, weight: "1", unit: "pair", img_suffix: "003" },
    { name: "Detergent Liquid Bottle", brand: "Surf Excel", category: "Home Care", price: 299, weight: "2", unit: "L", img_suffix: "004" },
    { name: "Detergent Powder Packet", brand: "Surf Excel", category: "Home Care", price: 169, weight: "1", unit: "kg", img_suffix: "005" },
    { name: "Dishwash Bar Soap", brand: "Vim", category: "Home Care", price: 20, weight: "100", unit: "g", img_suffix: "006" },
    { name: "Dishwash Liquid Bottle", brand: "Vim", category: "Home Care", price: 80, weight: "250", unit: "ml", img_suffix: "007" },
    { name: "Fabric Softener Bottle", brand: "Comfort", category: "Home Care", price: 189, weight: "1", unit: "L", img_suffix: "008" },
    { name: "Floor Cleaner Bottle", brand: "Harpic", category: "Home Care", price: 145, weight: "500", unit: "ml", img_suffix: "009" },
    { name: "Garbage Bags Roll", brand: "Amazon", category: "Home Care", price: 85, weight: "30", unit: "pcs", img_suffix: "010" },
    { name: "Glass Cleaner Spray", brand: "Colin", category: "Home Care", price: 125, weight: "500", unit: "ml", img_suffix: "011" },
    { name: "Insect Killer Spray", brand: "Hit", category: "Home Care", price: 125, weight: "400", unit: "ml", img_suffix: "012" },
    { name: "Mop Cleaner Liquid", brand: "Clorox", category: "Home Care", price: 155, weight: "1", unit: "L", img_suffix: "013" },
    { name: "Mosquito Repellent", brand: "All Out", category: "Home Care", price: 75, weight: "45", unit: "ml", img_suffix: "014" },
    { name: "Phenyl Floor Cleaner", brand: "Numal", category: "Home Care", price: 95, weight: "500", unit: "ml", img_suffix: "015" },
    { name: "Room Freshener Spray", brand: "Godrej", category: "Home Care", price: 165, weight: "300", unit: "ml", img_suffix: "016" },
    { name: "Scrub Pad Packet", brand: "3M", category: "Home Care", price: 65, weight: "4", unit: "pcs", img_suffix: "017" },
    { name: "Toilet Cleaner Bottle", brand: "Harpic", category: "Home Care", price: 129, weight: "500", unit: "ml", img_suffix: "018" },
    { name: "Toilet Freshener Block", brand: "Harpic", category: "Home Care", price: 45, weight: "50", unit: "g", img_suffix: "019" },
    { name: "Washing Bar Soap", brand: "Santoor", category: "Home Care", price: 35, weight: "150", unit: "g", img_suffix: "020" },
    // Personal Care (Images: 001-019)
    { name: "Baby Lotion Bottle", brand: "Johnson's", category: "Personal Care", price: 125, weight: "300", unit: "ml", img_suffix: "001" },
    { name: "Baby Shampoo Bottle", brand: "Johnson's", category: "Personal Care", price: 95, weight: "200", unit: "ml", img_suffix: "002" },
    { name: "Baby Soap Packet", brand: "Johnson's", category: "Personal Care", price: 45, weight: "75", unit: "g", img_suffix: "003" },
    { name: "Body Lotion Bottle", brand: "Nivea", category: "Personal Care", price: 165, weight: "400", unit: "ml", img_suffix: "004" },
    { name: "Conditioner Bottle", brand: "Dove", category: "Personal Care", price: 140, weight: "180", unit: "ml", img_suffix: "005" },
    { name: "Face Cream Jar", brand: "Fair & Lovely", category: "Personal Care", price: 145, weight: "50", unit: "g", img_suffix: "006" },
    { name: "Face Wash Tube", brand: "Garnier", category: "Personal Care", price: 125, weight: "100", unit: "g", img_suffix: "007" },
    { name: "Hair Gel Tube", brand: "Set Wet", category: "Personal Care", price: 85, weight: "100", unit: "g", img_suffix: "008" },
    { name: "Hair Oil Bottle", brand: "Parachute", category: "Personal Care", price: 95, weight: "300", unit: "ml", img_suffix: "009" },
    { name: "Hand Sanitizer Bottle", brand: "Dettol", category: "Personal Care", price: 75, weight: "200", unit: "ml", img_suffix: "010" },
    { name: "Hand Wash Bottle", brand: "Dettol", category: "Personal Care", price: 85, weight: "250", unit: "ml", img_suffix: "011" },
    { name: "Perfume Deodorant Spray", brand: "Denim", category: "Personal Care", price: 195, weight: "150", unit: "ml", img_suffix: "012" },
    { name: "Razor Pack", brand: "Gillette", category: "Personal Care", price: 120, weight: "4", unit: "pcs", img_suffix: "013" },
    { name: "Sanitary Napkin Pack", brand: "Whisper", category: "Personal Care", price: 65, weight: "20", unit: "pcs", img_suffix: "014" },
    { name: "Shampoo Bottle", brand: "Dove", category: "Personal Care", price: 150, weight: "180", unit: "ml", img_suffix: "015" },
    { name: "Shaving Cream Tube", brand: "Gillette", category: "Personal Care", price: 95, weight: "150", unit: "g", img_suffix: "016" },
    { name: "Soap Bar Packet", brand: "Dove", category: "Personal Care", price: 35, weight: "75", unit: "g", img_suffix: "017" },
    { name: "Talcum Powder", brand: "Ponds", category: "Personal Care", price: 75, weight: "200", unit: "g", img_suffix: "018" },
    { name: "Toothbrush Pack", brand: "Colgate", category: "Personal Care", price: 45, weight: "2", unit: "pcs", img_suffix: "019" },
];

const generateProducts = () => {
    return productsData.map((p, index) => {
        const id = `PRD${String(index + 1).padStart(3, '0')}`;
        const image = `/images/grocery/${p.category}/${p.name.toLowerCase().replace(/\s+/g, '_')}_${p.img_suffix}.jpg`;

        return {
            id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            pricing: { mrp: Math.round(p.price * 1.1), selling_price: p.price },
            packaging: { quantity: p.weight, unit: p.unit },
            availability: { in_stock: true },
            image
        };
    });
};

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing products
        await Product.deleteMany({});
        console.log("Cleared existing products");

        // Generate and insert products
        const products = generateProducts();
        const inserted = await Product.insertMany(products);
        console.log(`Inserted ${inserted.length} products`);

        // Verify
        const count = await Product.countDocuments();
        console.log(`Total products in database: ${count}`);

        // Show sample products
        console.log("\nSample products:");
        inserted.slice(0, 5).forEach((p, i) => {
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
