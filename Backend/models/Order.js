const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      mask: { type: String }, // Save mask for customized items
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      
      // ✅ SAVE CUSTOMIZATION SNAPSHOT
      selectedColor: { type: String },
      selectedColorName: { type: String },
      selectedMaterial: { type: String }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true } // ✅ Added Phone
  },
  paymentMethod: { type: String, required: true, default: 'Card' },
  paymentResult: { // For Stripe/Razorpay later
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  status: { type: String, required: true, default: 'Processing' }, // ✅ Status from Backend
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);