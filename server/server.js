require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// CORS — allow the client (Live Server or file:// origin)
app.use(
    cors({
        origin: [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:3001',
            // Allow null origin for file:// protocol during dev
        ],
        credentials: true,
    })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SHOP.CO API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 SHOP.CO Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Products:     http://localhost:${PORT}/api/products\n`);
});
