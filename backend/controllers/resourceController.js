const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const Exam = require('../models/Exam');
const { logAudit } = require('../utils/auditLogger');
const { checkResourceConflict } = require('../utils/conflictChecker');

// @desc    Get all resources with filters & search
// @route   GET /api/resources
// @access  Public / Private
const getResources = async (req, res, next) => {
  try {
    const { department, type, minCapacity, maxCapacity, search, isActive } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }
    if (type) {
      query.type = type.toLowerCase();
    }
    if (minCapacity || maxCapacity) {
      query.capacity = {};
      if (minCapacity) query.capacity.$gte = Number(minCapacity);
      if (maxCapacity) query.capacity.$lte = Number(maxCapacity);
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource with its schedule/availability
// @route   GET /api/resources/:id
// @access  Public / Private
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('department', 'name code');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const { date } = req.query;
    let dateFilter = date || new Date().toISOString().split('T')[0];

    // Fetch approved bookings for this resource on this date
    const bookings = await Booking.find({
      resource: resource._id,
      date: dateFilter,
      status: { $in: ['approved', 'pending'] }
    }).populate('requestedBy', 'name email department');

    // Fetch exams occupying this resource on this date
    const exams = await Exam.find({
      rooms: resource._id,
      date: dateFilter
    }).populate('department', 'name code');

    res.json({
      success: true,
      data: resource,
      schedule: {
        date: dateFilter,
        bookings,
        exams
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check live availability for a resource at a given date/time
// @route   POST /api/resources/:id/check-availability
// @access  Private
const checkAvailability = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;
    const resourceId = req.params.id;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide date, startTime, and endTime' });
    }

    const conflict = await checkResourceConflict({
      resourceId,
      date,
      startTime,
      endTime
    });

    // Also get all bookings/exams for the full day to show time slot status
    const dayBookings = await Booking.find({
      resource: resourceId,
      date: date,
      status: { $in: ['approved', 'pending'] }
    }).populate('requestedBy', 'name email');

    const dayExams = await Exam.find({
      rooms: resourceId,
      date: date
    }).populate('invigilators', 'name');

    res.json({
      success: true,
      available: !conflict.conflict,
      conflictDetails: conflict.conflict ? conflict : null,
      daySchedule: {
        bookings: dayBookings,
        exams: dayExams
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create resource
// @route   POST /api/resources
// @access  Private (Admin or HOD of department)
const createResource = async (req, res, next) => {
  try {
    const { name, type, department, capacity, location, description, features, isActive } = req.body;

    // Authorization check: HOD can only create resources for their own department
    if (req.user.role === 'hod' && req.user.department._id.toString() !== department) {
      return res.status(403).json({
        success: false,
        message: 'HODs can only create resources for their own department'
      });
    }

    const resource = await Resource.create({
      name,
      type,
      department: req.user.role === 'hod' ? req.user.department._id : department,
      capacity: Number(capacity) || 0,
      location,
      description: description || '',
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []),
      isActive: isActive !== undefined ? isActive : true
    });

    await logAudit({
      action: 'RESOURCE_CREATE',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: resource._id,
      details: { name, type, location, department }
    });

    const populated = await Resource.findById(resource._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin or HOD of department)
const updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Authorization check: HOD can only update their department's resources
    if (req.user.role === 'hod' && resource.department.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'HODs can only update resources belonging to their own department'
      });
    }

    const updates = { ...req.body };
    if (updates.features && typeof updates.features === 'string') {
      updates.features = updates.features.split(',').map(f => f.trim());
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('department', 'name code');

    await logAudit({
      action: 'RESOURCE_UPDATE',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: resource._id,
      details: updates
    });

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin or HOD of department)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (req.user.role === 'hod' && resource.department.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'HODs can only delete resources belonging to their own department'
      });
    }

    await resource.deleteOne();

    await logAudit({
      action: 'RESOURCE_DELETE',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: req.params.id,
      details: { name: resource.name }
    });

    res.json({
      success: true,
      message: 'Resource removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  checkAvailability,
  createResource,
  updateResource,
  deleteResource
};
