require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
    {
        name: 'Gradient Graphic Tee',
        price: 145,
        originalPrice: 200,
        rating: 4.5,
        reviews: 3160,
        image: '../assets/images/gradient-tshirt.jfif',
        category: 'casual',
        colors: ['#667eea', '#764ba2'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description:
            'The graphic t-shirt which is perfect for any occasion. Crafted from soft, breathable cotton, it offers superior comfort and style.',
    },
    {
        name: 'Checkered Shirt',
        price: 180,
        originalPrice: 250,
        rating: 4.5,
        reviews: 456,
        image: '../assets/images/checkered-shirt.jfif',
        category: 'casual',
        colors: ['#9c1f2d', '#efefef'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description:
            'A classic checkered shirt that works with any outfit. Made from quality fabric for everyday wear.',
    },
    {
        name: 'Skinny Fit Jeans',
        price: 240,
        originalPrice: 260,
        rating: 3.5,
        reviews: 1345,
        image: '../assets/images/jeans.jfif',
        category: 'casual',
        colors: ['#1a3a5c', '#4a5f8f'],
        sizes: ['28', '30', '32', '34', '36'],
        description:
            'Perfect for a night out. These sleek skinny jeans will make you look amazing.',
    },
    {
        name: 'Vertical Striped Shirt',
        price: 212,
        originalPrice: 232,
        rating: 5.0,
        reviews: 501,
        image: '../assets/images/striped-shirt.jfif',
        category: 'casual',
        colors: ['#5a7d3a', '#e8d4b8'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description:
            'A timeless striped shirt featuring comfortable fit and premium quality fabric.',
    },
    {
        name: 'Courage Graphic Tee',
        price: 145,
        originalPrice: 200,
        rating: 4.0,
        reviews: 401,
        image: '../assets/images/courage-tshirt.jfif',
        category: 'casual',
        colors: ['#e87333', '#1a1a1a'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description:
            'Express yourself with this graphic t-shirt. Great quality and comfortable fit.',
    },
    {
        name: 'Contrast Trim Polo',
        price: 212,
        originalPrice: 242,
        rating: 4.0,
        reviews: 233,
        image: '../assets/images/polo-shirt.jfif',
        category: 'formal',
        colors: ['#0f5a8f', '#e8e8e8'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description:
            'Elegant polo shirt with contrast trims. Perfect for business casual.',
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert seed data
        const inserted = await Product.insertMany(products);
        console.log(`✅ Seeded ${inserted.length} products successfully`);
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

seed();
