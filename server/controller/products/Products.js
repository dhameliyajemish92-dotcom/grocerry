import Products from '../../model/Products.js';
import jwt from 'jsonwebtoken';
import Pagination from '../../utils/pagination.js';
import CSVtoJSON from "../../utils/CSVtoJSON.js";
import { parsePDFProductData } from '../../utils/pdfProductParser.js';

export const productsSearch = async (req, res) => {
    try {

        const products = await Products.find({ "name": { $regex: req.query.search, $options: "i" } });

        const productsPaged = Pagination(req.query.page, products);

        const numberOfPages = Math.ceil(products.length / 2);
        res.status(200).json({ total_pages: numberOfPages, products: productsPaged });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const { products } = req.body;
        for (const product of products) {
            const searchedProduct = await Products.findOne({ id: product.product_id });
            if (searchedProduct && searchedProduct.stock !== undefined) {
                const newStock = Math.max(0, searchedProduct.stock - product.quantity);
                await Products.findOneAndUpdate(
                    { id: product.product_id }, 
                    { 
                        "stock": newStock,
                        "availability.in_stock": newStock > 0
                    }
                );
            }
        }
        res.status(200).json({ message: "updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const ShowProductsPerPage = async (req, res) => {
    try {
        let products = [];

        const itemsPerPage = 20;

        // If there is category: just filter them by the category,
        // then do the pagination on it.
        console.log(`[ShowProductsPerPage] Category param: ${req.query.category}`);
        if (req.query.category) {
            products = await ShowProductsPerCategory(req.query.category, products);
        } else
            products = await Products.find();
        
        console.log(`[ShowProductsPerPage] Found ${products.length} products in database`);
        if (products.length > 0) {
            console.log(`[ShowProductsPerPage] First product:`, JSON.stringify(products[0], null, 2));
        }
        
        const numberOfPages = Math.ceil(products.length / itemsPerPage);
        // in both cases you have to paginate the products
        products = Pagination(req.query.page, products, itemsPerPage);

        console.log(`[ShowProductsPerPage] Returning ${products.length} products, total_pages: ${numberOfPages}`);
        res.status(200).json({ total_pages: numberOfPages, products: products });

    } catch (error) {
        console.error(`[ShowProductsPerPage] Error:`, error.message);
        res.status(500).json({ message: error.message });
    }
}

const ShowProductsPerCategory = async (category, products) => {
    try {
        // Handle category names with spaces (e.g., "Home%20Care" -> "HomeCare")
        const normalizedCategory = category.replace(/%20/g, ' ').replace(/\s+/g, '');
        
        products = await Products.find({ 
            "category": { $regex: normalizedCategory, $options: "i" }
        });
        return products;

    } catch (error) {
        throw error;
    }
}

const mapProductData = (data) => {
    return {
        id: data.product_id || data.id,
        name: data.name,
        brand: data.brand || 'N/A',
        category: data.category,
        stock: parseInt(data.stock || 0),
        image: data.image,
        pricing: {
            mrp: parseFloat(data.mrp || data.price || 0),
            selling_price: parseFloat(data.selling_price || data.price || 0)
        },
        packaging: {
            quantity: String(data.quantity || data.weight || "1"),
            unit: String(data.unit || data.measurement || "kg")
        },
        availability: {
            in_stock: parseInt(data.stock || 0) > 0
        }
    };
};

export const PostProducts = async (req, res) => {
    try {
        const productData = mapProductData(req.body);
        const newProduct = new Products(productData);
        await newProduct.save();
        res.status(201).send(newProduct);
    } catch (error) {
        console.error("Post Product Error:", error);
        res.status(409).json({ message: error.message });
    }
}

export const ProductsRecommendations = async (req, res) => {
    try {
        // get 2 different random categories from the database
        let categories = await Products.aggregate([
            { $sample: { size: 2 } },
            { $project: { category: 1, _id: 0 } }
        ]);

        if (!categories || categories.length === 0) {
            return res.status(200).json([]);
        }

        // if the categories are the same, get another two
        if (categories.length > 1) {
            let attempts = 0;
            while (categories[0].category === categories[1].category && attempts < 5) {
                categories = await Products.aggregate([
                    { $sample: { size: 2 } },
                    { $project: { category: 1, _id: 0 } }
                ]);
                attempts++;
            }
        }

        let products = [];

        // get the first category products
        if (categories[0]) {
            let productscategory1 =
                await Products.aggregate([
                    { $match: { category: categories[0].category } },
                    { $sample: { size: 5 } },
                    {
                        $match: {
                            $or: [
                                { stock: { $gt: 0 } },
                                { "availability.in_stock": true }
                            ]
                        }
                    }
                ]);
            products.push({ category: categories[0].category, products: productscategory1 });
        }

        // get the second category products
        if (categories[1]) {
            let productscategory2 =
                await Products.aggregate([
                    { $match: { category: categories[1].category } },
                    { $sample: { size: 5 } },
                    {
                        $match: {
                            $or: [
                                { stock: { $gt: 0 } },
                                { "availability.in_stock": true }
                            ]
                        }
                    }
                ]);
            products.push({ category: categories[1].category, products: productscategory2 });
        }

        res.set('Cache-control', 'no-store');
        return res.status(200).json(products);
    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(200).json([]); // Return empty array instead of error to prevent frontend crash
    }
}

export const getProductsArr = async (req, res) => {
    try {
        const { arr } = req.body;

        const products = await Products.find({ id: { $in: arr } });

        res.status(200).json(products);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}

/**
 * Validates cart products before processing to purchasing
 *
 * @param {array<object>} req.body.cart - an array of user selected products
 */
export const validateCart = async (req, res) => {
    const { cart } = req.body;

    let totalPrice = 0;
    const products = [];

    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ message: "Invalid cart data. Cart must be an array." });
    }

    try {
        for (const cartProduct of cart) {
            // get the product from database by id
            const product = await Products.findOne({ id: cartProduct.product_id });

            // 404 - the product doesn't exist in the database
            if (!product) {
                return res.status(404).json({
                    message: `${cartProduct.name} was not found in the database`,
                    product_id: cartProduct.product_id,
                });
            }

            const stock = product.stock ?? (product.availability?.in_stock ? 999 : 0);
            const price = product.pricing?.selling_price ?? product.price ?? 0;

            if (stock <= 0) {
                return res.status(400).json({
                    message: `${product.name} is out of stock`,
                    product_id: product.id
                });
            }

            if (stock < cartProduct.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}. Available: ${stock}, Requested: ${cartProduct.quantity}`,
                    product_id: product.id
                });
            }

            // calculate total price from the database
            totalPrice += price * cartProduct.quantity;

            // add products data to the `products` array
            products.push({
                product_id: product.id,
                name: product.name,
                price: price,
                quantity: cartProduct.quantity,
                image: product.image,
                brand: product.brand,
                packaging: product.packaging
            });
        }

        // round to 2 decimals
        totalPrice = totalPrice.toFixed(2);

        if (!process.env.JWT_SECRET_KEY && process.env.NODE_ENV === 'production') {
            console.error("JWT_SECRET_KEY is not defined in environment variables");
            return res.status(500).json({ message: "Internal Server Configuration Error" });
        }

        // generate validation/checkout token
        const token = jwt.sign(
            { products: products, total: totalPrice },
            process.env.JWT_SECRET_KEY || 'test',
            { expiresIn: process.env.JWT_CHECKOUT_TTL || '1h' });

        // validated successfully
        return res.status(200).json({
            total: totalPrice,
            cart: cart,
            token: token
        });
    } catch (e) {
        console.error("ERROR IN VALIDATE CART:", e);
        // internal error
        return res.status(500).json({
            message: e.message
        });
    }
}

export const adminUpdateProducts = async (req, res) => {
    const { csv, mode } = req.body;

    if (!['UPDATE', 'REGENERATE'].includes(mode))
        return res.status(400).json({ message: " Unknown mode" });

    const productsJson = CSVtoJSON(csv);

    try {
        if (mode === "UPDATE") {
            const updatedProducts = await updateProducts(productsJson);
            return res.status(200).json(updatedProducts);
        }

        if (mode === 'REGENERATE') {
            const updatedProducts = await regenerateDatabase(productsJson);
            return res.status(200).json(updatedProducts);
        }

    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}

const updateProducts = async (products) => {
    const updated = [];

    for (const product of products) {
        const productData = mapProductData(product);
        const res = await Products.updateOne({ id: productData.id }, productData);

        // if the product was updated push it to the array
        if (res.modifiedCount !== 0)
            updated.push(productData);
        // if the product doesn't exist in the database, add it
        else if (res.matchedCount === 0) {
            await Products.create(productData);
            updated.push(productData);
        }
    }

    return updated;
}

const regenerateDatabase = async (products) => {
    await Products.deleteMany();
    const mappedProducts = products.map(p => mapProductData(p));
    await Products.insertMany(mappedProducts);
    return mappedProducts;
}

/**
 * Upload and parse products from PDF file
 * Expected format: CSV-like data within the PDF
 */
export const uploadProductsFromPDF = async (req, res) => {
    try {
        if (!req.files || !req.files.pdf) {
            return res.status(400).json({ message: "Please upload a PDF file" });
        }

        const { mode } = req.body;
        if (!['UPDATE', 'REGENERATE'].includes(mode)) {
            return res.status(400).json({ message: "Please select a valid mode (UPDATE or REGENERATE)" });
        }

        const pdfBuffer = req.files.pdf.data;

        // Parse the PDF
        const parseResult = await parsePDFProductData(pdfBuffer);

        if (!parseResult.success) {
            const errorMsg = parseResult.isScannedPDF
                ? "PDF appears to be scanned/image-based. Please use a text-based PDF or convert it to text format first."
                : "Failed to parse PDF: " + parseResult.error;
            return res.status(400).json({ message: errorMsg, details: parseResult });
        }

        if (parseResult.totalProducts === 0) {
            return res.status(400).json({
                message: "No products found in the PDF. Please check the format.",
                sampleText: parseResult.sampleText || null
            });
        }

        let result;

        if (mode === "UPDATE") {
            result = await updateProducts(parseResult.products);
        } else {
            result = await regenerateDatabase(parseResult.products);
        }

        return res.status(200).json({
            message: `Successfully processed ${parseResult.totalProducts} products`,
            products: result,
            parsedProducts: parseResult.products.map(p => ({ name: p.name, price: p.price, qty: p.stock })),
            errors: parseResult.errors
        });

    } catch (e) {
        console.error("PDF Upload Error:", e);
        return res.status(500).json({ message: e.message });
    }
}