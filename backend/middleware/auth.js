const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development');

      req.user = await User.findById(decoded.id).select('-password').populate('department');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.'
        });
      }

      next();
    } catch (err) {
      console.error('Auth verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please authenticate.'
      });
    }

    const userRole = req.user.role;
    const hasRole = roles.some(role => {
      if (role === userRole) return true;
      if ((role === 'admin' || role === 'super_admin') && (userRole === 'admin' || userRole === 'super_admin')) return true;
      if ((role === 'hod' || role === 'department_admin') && (userRole === 'hod' || userRole === 'department_admin')) return true;
      return false;
    });

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
