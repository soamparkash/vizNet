const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// 1. CREATE ORDER (WITH SOLD UNITS UPDATE)
router.post('/', protect, async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentResult
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  try {
    // ✅ UPDATE SOLD UNITS FOR EACH PRODUCT
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.sold = (product.sold || 0) + item.qty;
        await product.save();
        console.log(`✅ Updated ${product.name}: sold units now ${product.sold}`);
      }
    }

    // CREATE ORDER
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'Processing'
    });

    const createdOrder = await order.save();
    console.log(`✅ Order created: ${createdOrder._id}`);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("❌ Order creation error:", error.message);
    res.status(500).json({ message: 'Failed to create order: ' + error.message });
  }
});

// 2. GET LOGGED IN USER ORDERS
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. GET ALL ORDERS (Admin)
router.get('/all', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. GET ORDER BY ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 5. DOWNLOAD INVOICE
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: Only the Order Owner or Admin can download
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Restriction: Invoice only available if Delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Invoice available only after delivery' });
    }

    // --- GENERATE PDF ---
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('VizNest Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: INV-${order._id.toString().slice(-6).toUpperCase()}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    // Details
    doc.text(`Billed To:`, { underline: true });
    doc.text(order.user.name);
    doc.text(order.user.email);
    doc.moveDown();
    
    doc.text(`Shipped To:`, { underline: true });
    doc.text(`${order.shippingAddress.address || order.shippingAddress.street}`);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.postalCode || order.shippingAddress.zip}`);
    doc.text(`${order.shippingAddress.country}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.moveDown();

    // Table Header
    const tableTop = 350;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 370, tableTop);
    doc.text('Total', 450, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Items
    let y = tableTop + 30;
    doc.font('Helvetica');
    
    order.orderItems.forEach(item => {
      doc.text(item.name, 50, y, { width: 240 });
      doc.text(item.qty.toString(), 300, y);
      doc.text(`Rs. ${item.price}`, 370, y);
      doc.text(`Rs. ${item.price * item.qty}`, 450, y);
      y += 30;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 20;

    // Total
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text(`Grand Total: Rs. ${order.totalPrice.toFixed(2)}`, 350, y, { align: 'right' });

    // Footer
    doc.fontSize(10).text('Thank you for shopping with VizNest!', 50, 700, { align: 'center', color: 'gray' });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 6. UPDATE ORDER STATUS (Admin)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            if (req.body.status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
