const Product = require('../models/Product');

// GET /api/products
const getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            color,
            size,
            search,
            page = 1,
            limit = 12,
            sort = '-createdAt',
        } = req.query;

        const query = {};

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (color) query.colors = { $elemMatch: { $regex: color, $options: 'i' } };
        if (size) query.sizes = { $in: [size] };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(query).sort(sort).skip(skip).limit(limitNum),
            Product.countDocuments(query),
        ]);

        res.json({
            products,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// POST /api/products  (admin / seeding use)
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Error creating product' });
    }
};

module.exports = { getProducts, getProductById, createProduct };
