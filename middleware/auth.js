const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is admin or super admin
const requireAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is super admin only
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
  }
};

// Middleware to check if user can add students (admin or super admin)
const canAddStudents = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Cannot add students.' });
  }
};

// Middleware to check if user can update/delete students (super admin only)
const canModifyStudents = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Only super admin can modify students.' });
  }
};

module.exports = {
  auth,
  requireAdmin,
  requireSuperAdmin,
  canAddStudents,
  canModifyStudents
};

