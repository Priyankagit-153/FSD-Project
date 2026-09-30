const Department = require('../models/Department');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public (or Private)
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ code: 1 });
    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department (Admin)
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description
    });

    await logAudit({
      action: 'DEPARTMENT_CREATE',
      performedBy: req.user._id,
      entityType: 'Department',
      entityId: department._id,
      details: { name, code }
    });

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department (Admin)
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: req.body.code ? req.body.code.toUpperCase() : undefined },
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await logAudit({
      action: 'DEPARTMENT_UPDATE',
      performedBy: req.user._id,
      entityType: 'Department',
      entityId: department._id,
      details: req.body
    });

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department (Admin)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await department.deleteOne();

    await logAudit({
      action: 'DEPARTMENT_DELETE',
      performedBy: req.user._id,
      entityType: 'Department',
      entityId: req.params.id,
      details: { name: department.name, code: department.code }
    });

    res.json({
      success: true,
      message: 'Department removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
