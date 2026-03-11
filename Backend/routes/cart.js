const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// --- 1. GET USER CART ---
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 2. ADD / UPDATE ITEM ---
router.post('/', protect, async (req, res) => {
  // ✅ Get 'mask' from body
  const { product, name, image, mask, price, qty, selectedColor, selectedColorName, selectedMaterial } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if this exact product + customization already exists
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === product &&
      item.selectedColor === selectedColor &&
      item.selectedMaterial === selectedMaterial
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty;
    } else {
      cart.items.push({
        product, 
        name,
        image,
        mask, // ✅ Save the mask
        price,
        qty,
        selectedColor,
        selectedColorName,
        selectedMaterial
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Cart Save Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 3. REMOVE ITEM ---
router.delete('/:itemId', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 4. CLEAR CART ---
router.delete('/', protect, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.json({ items: [] });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;