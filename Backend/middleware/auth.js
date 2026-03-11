const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      // ✅ If user still exists in DB, move to next
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      return next(); // 👈 Use 'return' to ensure code stops here
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  // ✅ Use 'return' so it doesn't try to call next() if no token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };