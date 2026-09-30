const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get users (with filters)
// @route   GET /api/users
// @access  Private (Admin can see all, HOD/Faculty can see faculty list for collaboration)
const getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }
    if (department) {
      query.department = department;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('department')
      .sort({ name: 1 })
      .select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'faculty',
      department: role === 'admin' ? null : department,
      designation: designation || 'Assistant Professor',
      phone: phone || ''
    });

    await logAudit({
      action: 'USER_CREATED_BY_ADMIN',
      performedBy: req.user._id,
      entityType: 'User',
      entityId: user._id,
      details: { name: user.name, email: user.email, role: user.role }
    });

    const populatedUser = await User.findById(user._id).populate('department').select('-password');

    res.status(201).json({
      success: true,
      data: populatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, role, department, designation, phone, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (department !== undefined) user.department = role === 'admin' ? null : department;
    if (designation) user.designation = designation;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = password; // Pre-save hook will hash it

    await user.save();

    await logAudit({
      action: 'USER_UPDATED_BY_ADMIN',
      performedBy: req.user._id,
      entityType: 'User',
      entityId: user._id,
      details: { name: user.name, role: user.role }
    });

    const updatedUser = await User.findById(user._id).populate('department').select('-password');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    await user.deleteOne();

    await logAudit({
      action: 'USER_DELETED_BY_ADMIN',
      performedBy: req.user._id,
      entityType: 'User',
      entityId: req.params.id,
      details: { name: user.name, email: user.email }
    });

    res.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
