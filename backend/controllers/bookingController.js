const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');
const { checkResourceConflict } = require('../utils/conflictChecker');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Faculty, HOD, Admin)
const createBooking = async (req, res, next) => {
  try {
    const { resource: resourceId, title, purpose, date, startTime, endTime } = req.body;

    if (!resourceId || !title || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resource, title/purpose, date, startTime, and endTime.'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be strictly earlier than end time.'
      });
    }

    const resource = await Resource.findById(resourceId).populate('department');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (!resource.isActive) {
      return res.status(400).json({ success: false, message: 'This resource is currently marked as inactive and cannot be booked.' });
    }

    // 1. Conflict Check: Reject if overlaps an approved booking or exam on the same resource
    const conflict = await checkResourceConflict({
      resourceId,
      date,
      startTime,
      endTime
    });

    if (conflict.conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: conflict.message,
        details: conflict.conflictingItem
      });
    }

    // Determine booking status: Admin can auto-approve or create pending; others create pending
    const initialStatus = 'pending';

    const booking = await Booking.create({
      resource: resourceId,
      requestedBy: req.user._id,
      department: req.user.department ? req.user.department._id : resource.department._id,
      title,
      purpose: purpose || '',
      date,
      startTime,
      endTime,
      status: initialStatus
    });

    // Notify HOD of the department owning the resource
    const hod = await User.findOne({
      role: 'hod',
      department: resource.department._id
    });

    if (hod) {
      await Notification.create({
        user: hod._id,
        title: 'New Booking Request',
        message: `${req.user.name} requested booking for "${resource.name}" on ${date} (${startTime}-${endTime}).`,
        type: 'booking_request',
        link: '/approvals'
      });
    }

    await logAudit({
      action: 'BOOKING_REQUEST_CREATED',
      performedBy: req.user._id,
      entityType: 'Booking',
      entityId: booking._id,
      details: {
        resourceName: resource.name,
        resourceDepartment: resource.department.name,
        date,
        startTime,
        endTime,
        title
      }
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('resource')
      .populate('requestedBy', 'name email department')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings (filterable by role, status, department, date)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const { status, resource, department, date, my } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (resource) {
      query.resource = resource;
    }
    if (date) {
      query.date = date;
    }

    const isSuperAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isDeptAdmin = req.user.role === 'hod' || req.user.role === 'department_admin';

    // If "my=true", return only bookings created by the logged in user
    if (my === 'true') {
      query.$or = [{ requestedBy: req.user._id }, { bookedBy: req.user._id }];
    } else if (!isSuperAdmin && !isDeptAdmin) {
      // Faculty and Student default
      if (req.query.allApproved === 'true') {
        query.status = 'approved';
      } else {
        query.$or = [{ requestedBy: req.user._id }, { bookedBy: req.user._id }];
      }
    } else if (isDeptAdmin) {
      // Department Admin / HOD
      if (department) {
        query.department = department;
      }
    }

    const bookings = await Booking.find(query)
      .populate('resource')
      .populate('requestedBy', 'name email department designation phone')
      .populate('approvedBy', 'name email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending approvals for HOD or Admin
// @route   GET /api/bookings/pending-approvals
// @access  Private (HOD, Admin)
const getPendingApprovals = async (req, res, next) => {
  try {
    let query = { status: 'pending' };

    if (req.user.role === 'hod') {
      // Find resources belonging to HOD's department
      const departmentResources = await Resource.find({ department: req.user.department._id }).select('_id');
      const resourceIds = departmentResources.map(r => r._id);
      query.resource = { $in: resourceIds };
    }

    const pendingBookings = await Booking.find(query)
      .populate('resource')
      .populate('requestedBy', 'name email department designation phone')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingBookings.length,
      data: pendingBookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('resource')
      .populate('requestedBy', 'name email department designation')
      .populate('approvedBy', 'name email')
      .populate('department', 'name code');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject a booking request
// @route   PUT /api/bookings/:id/status
// @access  Private (HOD, Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either "approved" or "rejected".' });
    }

    const booking = await Booking.findById(req.params.id).populate('resource');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isSuperAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isDeptAdmin = req.user.role === 'hod' || req.user.role === 'department_admin';

    // Role check: Only Admin or HOD of the resource's department can approve/reject
    if (!isSuperAdmin) {
      if (!isDeptAdmin || booking.resource.department.toString() !== req.user.department?._id?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are only authorized to approve or reject requests for your department\'s resources.'
        });
      }
    }

    // If approving, re-check conflict in case another booking was approved in the meantime
    if (status === 'approved') {
      const conflict = await checkResourceConflict({
        resourceId: booking.resource._id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        excludeBookingId: booking._id
      });

      if (conflict.conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `Cannot approve: ${conflict.message}`,
          details: conflict.conflictingItem,
          alternatives: conflict.alternatives || []
        });
      }
    }

    booking.status = status;
    booking.remarks = remarks || (status === 'approved' ? 'Request approved by department administrator.' : 'Request rejected.');
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();

    await booking.save();

    // Sync with ResourceRequest if exists
    try {
      const ResourceRequest = require('../models/ResourceRequest');
      await ResourceRequest.findOneAndUpdate(
        { $or: [{ _id: booking.request }, { booking: booking._id }] },
        {
          status,
          remarks: booking.remarks,
          approvedBy: status === 'approved' ? req.user._id : undefined,
          approvedAt: status === 'approved' ? new Date() : undefined,
          rejectedBy: status === 'rejected' ? req.user._id : undefined,
          rejectedAt: status === 'rejected' ? new Date() : undefined
        }
      );
    } catch (e) {
      console.warn('Sync with ResourceRequest skipped:', e.message);
    }

    // Notify requester
    await Notification.create({
      user: booking.requestedBy,
      title: `Booking ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your booking request for "${booking.resource.name}" on ${booking.date} (${booking.startTime}-${booking.endTime}) was ${status}. Remarks: ${booking.remarks}`,
      type: status === 'approved' ? 'booking_approved' : 'booking_rejected',
      link: '/my-bookings'
    });

    // Record Audit Log
    await logAudit({
      action: status === 'approved' ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
      performedBy: req.user._id,
      entityType: 'Booking',
      entityId: booking._id,
      details: {
        resourceName: booking.resource.name,
        date: booking.date,
        time: `${booking.startTime}-${booking.endTime}`,
        status,
        remarks: booking.remarks
      }
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('resource')
      .populate('requestedBy', 'name email department')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      message: `Booking has been ${status} successfully.`,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking (by requester or admin)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('resource');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Only requester or admin can cancel
    if (req.user.role !== 'admin' && booking.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking.' });
    }

    booking.status = 'cancelled';
    booking.remarks = req.body.remarks || 'Cancelled by requester';
    await booking.save();

    await logAudit({
      action: 'BOOKING_CANCELLED',
      performedBy: req.user._id,
      entityType: 'Booking',
      entityId: booking._id,
      details: { resourceName: booking.resource.name, date: booking.date }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getPendingApprovals,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};
