const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
      mask: { type: String }, // ✅ ADDED THIS (Stores the mask URL)
      price: { type: Number, required: true },
      qty: { type: Number, required: true, default: 1 },
      
      // Customization Fields
      selectedColor: { type: String },     
      selectedColorName: { type: String }, 
      selectedMaterial: { type: String },  
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);