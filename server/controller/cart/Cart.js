import Cart from "../../model/Cart.js";
import Products from "../../model/Products.js";

export const getCart = async (req, res) => {
    const userId = req.user.id;
    try {
        let cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            cart = await Cart.create({ user_id: userId, products: [] });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const addToCart = async (req, res) => {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ user_id: userId });
        const product = await Products.findOne({ id: product_id });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!cart) {
            cart = await Cart.create({
                user_id: userId,
                products: [{
                    product_id,
                    quantity,
                    name: product.name,
                    price: product.pricing.selling_price,
                    image: product.image
                }]
            });
        } else {
            const itemIndex = cart.products.findIndex(p => p.product_id === product_id);

            if (itemIndex > -1) {
                cart.products[itemIndex].quantity += quantity;
            } else {
                cart.products.push({
                    product_id,
                    quantity,
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
}

export const removeFromCart = async (req, res) => {
    const userId = req.user.id;
    const { product_id } = req.body;

    try {
        let cart = await Cart.findOne({ user_id: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.products = cart.products.filter(p => p.product_id !== product_id);
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateCartItem = async (req, res) => {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ user_id: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.products.findIndex(p => p.product_id === product_id);
        if (itemIndex > -1) {
            cart.products[itemIndex].quantity = quantity;
            if (cart.products[itemIndex].quantity <= 0) {
                cart.products.splice(itemIndex, 1);
            }
            await cart.save();
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
