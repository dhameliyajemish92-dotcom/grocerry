import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        brand: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        pricing: {
            mrp: {
                type: Number,
                required: true
            },
            selling_price: {
                type: Number,
                required: true
            }
        },

        packaging: {
            quantity: {
                type: String,   // "5"
                required: true
            },
            unit: {
                type: String,   // "kg"
                required: true
            }
        },

        availability: {
            in_stock: {
                type: Boolean,
                default: true
            }
        },

        image: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        strict: true
    }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
