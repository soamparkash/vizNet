const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const upload = require('../config/upload');

// --- 1. GET ALL PRODUCTS ---
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 2. GET SINGLE PRODUCT ---
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- CONFIG: FILE UPLOAD FIELDS ---
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'mask', maxCount: 1 }
]);

// --- 3. CREATE PRODUCT (ADMIN) ---
router.post('/', protect, admin, uploadFields, async (req, res) => {
  try {
    const { name, price, category, description, customizable, details, materials } = req.body;
    
    const image = req.files['image'] ? req.files['image'][0].path : '';
    const mask = req.files['mask'] ? req.files['mask'][0].path : '';
    const images = req.files['gallery'] ? req.files['gallery'].map(file => file.path) : [];

    let parsedDetails = [];
    let parsedMaterials = [];

    try {
        if (details) parsedDetails = JSON.parse(details);
        if (materials) parsedMaterials = JSON.parse(materials);
    } catch (e) {
        console.error("JSON Parse Error:", e);
    }

    const product = new Product({
      user: req.user._id,
      name, price, category, description,
      customizable: customizable === 'true',
      details: parsedDetails,
      materials: parsedMaterials,
      image, images, mask,
      rating: 0, numReviews: 0, reviews: []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// --- 4. UPDATE PRODUCT (PUT) ---
router.put('/:id', protect, admin, uploadFields, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, price, category, description, customizable, details, materials } = req.body;

        // Update fields if provided
        product.name = name || product.name;
        product.price = price || product.price;
        product.category = category || product.category;
        product.description = description || product.description;
        product.customizable = customizable === 'true';

        // Parse and Update Arrays
        if (details) {
            try { product.details = JSON.parse(details); } catch (e) {}
        }
        if (materials) {
            try { product.materials = JSON.parse(materials); } catch (e) {}
        }

        // Handle File Updates (Only if new files are uploaded)
        if (req.files['image']) product.image = req.files['image'][0].path;
        if (req.files['mask']) product.mask = req.files['mask'][0].path;
        if (req.files['gallery']) {
            product.images = req.files['gallery'].map(file => file.path);
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

// --- 5. DELETE PRODUCT ---
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 6. CREATE REVIEW (POST) ---
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
            if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });
            
            const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// --- 7. UPDATE REVIEW (PUT) - ✅ ADDED isEdited LOGIC ---
router.put('/:id/reviews/:reviewId', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            // Find the specific review inside the product
            const review = product.reviews.id(req.params.reviewId);

            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            // Ensure the user trying to edit is the one who created it
            if (review.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            // Update Review Data
            review.rating = Number(rating);
            review.comment = comment;
            review.isEdited = true; // ✅ Mark as edited

            // Recalculate Average Rating
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
            product.rating = product.rating.toFixed(1);

            await product.save();
            res.json({ message: 'Review updated' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Review Update Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;