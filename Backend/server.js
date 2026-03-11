// 1. SSL FIX (Must be at the very top)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

// Initialize Passport Config
require('./config/passport')(passport);

const app = express();

// =====================================================
// ✅ CRITICAL MIDDLEWARE ORDER
// =====================================================

// 1️⃣ CORS (FIRST)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2️⃣ BODY PARSER (SECOND)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Custom error handler for JSON parsing (for FormData requests)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err && req.is('multipart/form-data')) {
    return next();
  }
  next(err);
});

// 3️⃣ SESSION MIDDLEWARE
app.use(session({
  secret: process.env.SESSION_SECRET || 'viznest_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 4️⃣ PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// 5️⃣ STATIC FILES
app.use('/uploads', express.static('uploads'));

// =====================================================
// 📍 ROUTES
// =====================================================

// Razorpay Key Route (FIXED: Return JSON, not plain text)
app.get('/api/config/razorpay', (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ error: 'Razorpay key not configured' });
  }
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products')); 
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));

// =====================================================
// ❌ ERROR HANDLING (LAST)
// =====================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// =====================================================
// 🚀 START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});