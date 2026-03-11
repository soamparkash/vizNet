const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  isEdited: { type: Boolean, default: false } 
}, { timestamps: true });

const materialSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 }, 
  description: { type: String }
});

const productSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  image: { type: String, required: true },
  images: [String],
  mask: { type: String }, 
  category: { type: String, required: true },
  description: { type: String, required: true },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true, default: 0 },
  
  // ✅ NEW: Track Total Sales
  sold: { type: Number, required: true, default: 0 }, 

  customizable: { type: Boolean, default: false },
  details: [{ label: String, value: String }],
  materials: [materialSchema], 

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);