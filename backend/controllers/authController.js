const User = require('../models/User');
const Department = require('../models/Department');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/auditLogger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_development', {
    expiresIn: '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
    }

    // Role safety: default to faculty if not admin/hod, or if trying to create admin without admin auth
    const assignedRole = ['admin', 'hod', 'faculty'].includes(role) ? role : 'faculty';

    let departmentId = department;
    if (assignedRole !== 'admin' && !departmentId) {
      // If no department specified, assign to first available department
      const firstDept = await Department.findOne();
      if (firstDept) departmentId = firstDept._id;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      department: assignedRole === 'admin' ? null : departmentId,
      designation: designation || 'Assistant Professor',
      phone: phone || ''
    });

    await logAudit({
      action: 'USER_REGISTER',
      performedBy: user._id,
      entityType: 'User',
      entityId: user._id,
      details: { name: user.name, email: user.email, role: user.role }
    });

    const populatedUser = await User.findById(user._id).populate('department');

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        department: populatedUser.department,
        designation: populatedUser.designation,
        phone: populatedUser.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('department');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await logAudit({
      action: 'USER_LOGIN',
      performedBy: user._id,
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role }
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.designation = req.body.designation || user.designation;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('department');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
