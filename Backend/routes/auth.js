const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../config/upload');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { protect, admin } = require('../middleware/auth');
const passport = require('passport');

// --- 1. SMART REGISTER (Handles Unverified Re-signups) ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  try {
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // If user exists and is already verified, block registration
      if (user.isVerified) {
        return res.status(400).json({ message: 'User already exists and is verified. Please log in.' });
      }
      // If user exists but NOT verified, update their info and send new OTP
      user.name = name;
      user.password = password; // This will be re-hashed by User.js pre-save hook
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationToken = otp;
      await user.save();
      
      await sendEmail({
        email: user.email,
        subject: `${otp} is your new VizNest Code`,
        html: `<h1>Welcome Back!</h1><p>Your new verification code is: <b>${otp}</b></p>`
      });

      return res.status(200).json({ message: 'User exists but unverified. New OTP sent!' });
    }

    // New User Logic
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user = await User.create({ 
      name, 
      email: cleanEmail, 
      password, 
      verificationToken: otp, 
      isVerified: false 
    });

    const message = `
      <div style="font-family: sans-serif; text-align: center; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
        <h1 style="color: #4f46e5;">Welcome to VizNest!</h1>
        <p>Your account verification code is:</p>
        <h2 style="font-size: 40px; letter-spacing: 5px; color: #111827;">${otp}</h2>
        <p>Please enter this code to complete your registration.</p>
      </div>
    `;

    await sendEmail({ email: user.email, subject: `${otp} is your VizNest Code`, html: message });
    res.status(201).json({ message: 'OTP sent to your email!' });

  } catch (error) {
    console.error("🔴 REGISTRATION ERROR:", error.message);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// --- 2. VERIFY OTP ---
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      verificationToken: otp 
    });
    
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP code' });

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT Secret missing in server config' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// --- 3. LOGIN (Check for Verification) ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        // We return a specific 401 message so the frontend knows to show the OTP screen
        return res.status(401).json({ message: 'Account not verified. Please verify your email.' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
        isAdmin: user.isAdmin,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 4. RESEND OTP (Used by Timer button) ---
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = newOtp;
    await user.save();

    await sendEmail({ 
      email: user.email, 
      subject: `New VizNest Code: ${newOtp}`, 
      html: `<h1>New Verification Code</h1><p>Your code is: <b>${newOtp}</b></p>` 
    });

    res.json({ message: 'New OTP sent to email!' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 5. FORGOT & RESET PASSWORD ---
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "No user found with that email" });

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(resetOtp).digest('hex');
    user.resetPasswordExpire = Date.now() + 600000; 
    await user.save();

    await sendEmail({ email: user.email, subject: 'Password Reset Code', html: `<h2>Code: ${resetOtp}</h2>` });
    res.json({ message: 'Reset code sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending email' });
  }
});

router.put('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      resetPasswordToken: hashedOtp, 
      resetPasswordExpire: { $gt: Date.now() } 
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- PROFILE ROUTES (Requires Protect Middleware) ---

// --- GET PROFILE ---
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  user ? res.json(user) : res.status(404).json({ message: 'User not found' });
});

// --- UPDATE PROFILE (WITH AVATAR) ---
const uploadAvatar = upload.single('avatar');
router.put('/profile', protect, uploadAvatar, async (req, res) => {
  try {
    console.log("📝 Profile Update Request - User:", req.user._id);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update text fields - only if provided
    if (req.body.name && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }
    
    if (req.body.email && req.body.email.trim()) {
      user.email = req.body.email.trim();
    }
    
    if (req.body.phone && req.body.phone.trim()) {
      user.phone = req.body.phone.trim();
    }
    
    // Avatar upload - File from Cloudinary via multer
    if (req.file) {
      user.avatar = req.file.path;
    }

    if (req.body.password && req.body.password.trim()) {
      user.password = req.body.password.trim();
    }

    const updatedUser = await user.save();

    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1] || '';

    res.status(200).json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      addresses: updatedUser.addresses,
      isAdmin: updatedUser.isAdmin,
      isVerified: updatedUser.isVerified,
      token,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile: ' + error.message 
    });
  }
});

// --- ADD ADDRESS (POST) ---
router.post('/address', protect, async (req, res) => {
    const { street, city, state, zip, country, phone, isPrimary } = req.body;
    const user = await User.findById(req.user._id);

    if(user) {
        if(isPrimary) {
            user.addresses.forEach(a => a.isPrimary = false);
        }
        
        const shouldBePrimary = isPrimary || user.addresses.length === 0;

        user.addresses.push({ 
            street, city, state, zip, country, 
            phone, 
            isPrimary: shouldBePrimary 
        });
        
        await user.save();
        res.json(user.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// --- UPDATE ADDRESS (PUT) ---
router.put('/address/:addressId', protect, async (req, res) => {
    const { street, city, state, zip, country, phone, isPrimary } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        const address = user.addresses.id(req.params.addressId);
        if (address) {
            // Update fields if provided
            address.street = street || address.street;
            address.city = city || address.city;
            address.state = state || address.state;
            address.zip = zip || address.zip;
            address.country = country || address.country;
            address.phone = phone || address.phone;

            // Handle Primary Toggle
            if (isPrimary) {
                user.addresses.forEach(a => a.isPrimary = false);
                address.isPrimary = true;
            }

            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'Address not found' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// --- DELETE ADDRESS ---
router.delete('/address/:addressId', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if(user) {
        user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
        await user.save();
        res.json(user.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// ==========================================
// GOOGLE AUTH ROUTES
// ==========================================

// 1. Initiate Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Google Callback (After user logs in at Google)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 3. Generate Token for the Google User
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // 4. Redirect to Frontend with Token
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    
    res.redirect(`${CLIENT_URL}/login-success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

module.exports = router;