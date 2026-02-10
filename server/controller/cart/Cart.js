import Cart from "../../model/Cart.js";
import Products from "../../model/Products.js";

export const getCart = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;

        let cart = await Cart.findOne({ user_id: userId });

        if (!cart) {
            cart = await Cart.create({ user_id: userId, products: [] });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;
        const { product_id, quantity } = req.body;

        const qty = Number(quantity);
        if (!product_id || qty <= 0) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }

        const product = await Products.findOne({ id: product_id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ user_id: userId });

        if (!cart) {
            cart = await Cart.create({
                user_id: userId,
                products: [{
                    product_id: product_id,
                    quantity: qty,
                    name: product.name,
                    price: product.pricing.selling_price,
                    image: product.image
                }]
            });
        } else {
            const itemIndex = cart.products.findIndex(
                p => p.product_id === product_id
            );

            if (itemIndex > -1) {
                cart.products[itemIndex].quantity += qty;
            } else {
                cart.products.push({
                    product_id: product_id,
                    quantity: qty,
                    name: product.name,
                    price: product.pricing.selling_price,
                    image: product.image
                });
            }

            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;
        const { product_id } = req.body;

        let cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.products = cart.products.filter(
            p => p.product_id.toString() !== product_id
        );

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;
        const { product_id, quantity } = req.body;
        const qty = Number(quantity);

        let cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.products.findIndex(
            p => p.product_id.toString() === product_id
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        if (qty <= 0) {
            cart.products.splice(itemIndex, 1);
        } else {
            cart.products[itemIndex].quantity = qty;
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
