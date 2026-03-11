const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String }, // ✅ NOT required
  isPrimary: { type: Boolean, default: false }
});


const userSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String },
  avatar: { type: String },
  isAdmin: { type: Boolean, default: false },
  addresses: [addressSchema],

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });


// ✅ FIXED async password hashing middleware (NO next)
userSchema.pre('save', async function () {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return;

  if (!this.password) {
    throw new Error('Password is required for hashing');
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// ✅ Match entered password with hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};


// ✅ Generate reset password token (optional helper)
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
