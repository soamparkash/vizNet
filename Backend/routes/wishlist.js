const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// --- 1. GET USER WISHLIST ---
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      return res.json([]);
    }
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 2. TOGGLE ITEM (Add/Remove) ---
router.post('/', protect, async (req, res) => {
  const { productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Check if product exists
    const index = wishlist.products.indexOf(productId);

    if (index > -1) {
      // Item exists -> Remove it
      wishlist.products.splice(index, 1);
      await wishlist.save();
      res.json({ message: 'Removed from wishlist', action: 'removed', products: wishlist.products });
    } else {
      // Item doesn't exist -> Add it
      wishlist.products.push(productId);
      await wishlist.save();
      res.json({ message: 'Added to wishlist', action: 'added', products: wishlist.products });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;