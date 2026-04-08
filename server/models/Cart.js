const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    color: { type: String, default: null },
    size: { type: String, default: null },
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
    },
    { timestamps: true }
);

// Virtual: total price
cartSchema.virtual('total').get(function () {
    return this.items.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * item.quantity;
    }, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
