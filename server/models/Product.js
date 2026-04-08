const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        originalPrice: {
            type: Number,
            min: [0, 'Original price cannot be negative'],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: ['casual', 'formal', 'party', 'gym'],
            default: 'casual',
        },
        colors: {
            type: [String],
            default: [],
        },
        sizes: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            default: '',
        },
        stock: {
            type: Number,
            default: 100,
        },
    },
    { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
