const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate(
            'items.product',
            'name price originalPrice image'
        );

        if (!cart) {
            cart = { user: req.user._id, items: [], total: 0 };
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

// POST /api/cart/add
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, color, size } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
            if (color) existingItem.color = color;
            if (size) existingItem.size = size;
        } else {
            cart.items.push({ product: productId, quantity, color, size });
        }

        await cart.save();
        await cart.populate('items.product', 'name price originalPrice image');

        res.json(cart);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Error adding to cart' });
    }
};

// PUT /api/cart/update/:itemId
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = parseInt(quantity);
        await cart.save();
        await cart.populate('items.product', 'name price originalPrice image');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart' });
    }
};

// DELETE /api/cart/remove/:itemId
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        await cart.save();
        await cart.populate('items.product', 'name price originalPrice image');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart' });
    }
};

// DELETE /api/cart/clear
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
