const ResourceRequest = require('../models/ResourceRequest');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');
const { checkResourceConflict } = require('../utils/conflictChecker');

// @desc    Create a new resource request
// @route   POST /api/resource-requests
// @access  Private (Faculty, Student, HOD, Admin)
const createResourceRequest = async (req, res, next) => {
  try {
    const { resource: resourceId, title, purpose, date, startTime, endTime, participants } = req.body;

    if (!resourceId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resource, date, start time, and end time.'
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

    if (!resource.isActive || resource.status === 'inactive' || resource.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: `Resource is currently ${resource.status || 'inactive'} and cannot be requested.`
      });
    }

    // 1. Conflict Check: Strict check on existing approved bookings and exams
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
        details: conflict.conflictingItem,
        alternatives: conflict.alternatives || []
      });
    }

    const requestingDept = req.user.department?._id || resource.department._id;
    const resourceDept = resource.department._id;

    const requestTitle = title || purpose || `${resource.name} Session`;

    const resourceRequest = await ResourceRequest.create({
      resource: resourceId,
      requestedBy: req.user._id,
      requestingDepartment: requestingDept,
      resourceDepartment: resourceDept,
      title: requestTitle,
      purpose: purpose || '',
      date,
      startTime,
      endTime,
      participants: Number(participants) || 1,
      status: 'pending'
    });

    // Also create or sync with Booking collection for compatibility
    const booking = await Booking.create({
      resource: resourceId,
      requestedBy: req.user._id,
      bookedBy: req.user._id,
      department: requestingDept,
      request: resourceRequest._id,
      title: requestTitle,
      purpose: purpose || '',
      date,
      startTime,
      endTime,
      status: 'pending'
    });

    resourceRequest.booking = booking._id;
    await resourceRequest.save();

    // Notify Department Admin / HOD of resource owner department
    const deptAdmins = await User.find({
      role: { $in: ['hod', 'department_admin'] },
      department: resourceDept
    });

    for (const admin of deptAdmins) {
      await Notification.create({
        user: admin._id,
        title: 'New Resource Request',
        message: `${req.user.name} submitted a request for "${resource.name}" on ${date} (${startTime}-${endTime}).`,
        type: 'booking_request',
        link: '/approvals'
      });
    }

    await logAudit({
      action: 'RESOURCE_REQUEST_CREATED',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: resourceRequest._id,
      details: {
        resource: resource.name,
        date,
        startTime,
        endTime,
        purpose
      }
    });

    const populated = await ResourceRequest.findById(resourceRequest._id)
      .populate('resource')
      .populate('requestedBy', 'name email department designation studentId')
      .populate('requestingDepartment', 'name code')
      .populate('resourceDepartment', 'name code');

    res.status(201).json({
      success: true,
      message: 'Resource request submitted successfully. Awaiting department approval.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resource requests (filtered by role/department/status)
// @route   GET /api/resource-requests
// @access  Private
const getResourceRequests = async (req, res, next) => {
  try {
    const { status, resource, department, date, my, incoming } = req.query;
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

    if (my === 'true') {
      query.requestedBy = req.user._id;
    } else if (incoming === 'true' && isDeptAdmin) {
      query.resourceDepartment = req.user.department?._id;
    } else if (!isSuperAdmin) {
      if (isDeptAdmin) {
        // Can see own requests or incoming requests for their department's resources
        query.$or = [
          { requestedBy: req.user._id },
          { resourceDepartment: req.user.department?._id }
        ];
      } else {
        // Students and Faculty see their own requests
        query.requestedBy = req.user._id;
      }
    }

    if (department && isSuperAdmin) {
      query.$or = [
        { requestingDepartment: department },
        { resourceDepartment: department }
      ];
    }

    const requests = await ResourceRequest.find(query)
      .populate('resource')
      .populate('requestedBy', 'name email department designation studentId phone')
      .populate('requestingDepartment', 'name code')
      .populate('resourceDepartment', 'name code')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource request
// @route   GET /api/resource-requests/:id
// @access  Private
const getResourceRequestById = async (req, res, next) => {
  try {
    const request = await ResourceRequest.findById(req.params.id)
      .populate('resource')
      .populate('requestedBy', 'name email department designation studentId phone')
      .populate('requestingDepartment', 'name code')
      .populate('resourceDepartment', 'name code')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Resource request not found.' });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject resource request
// @route   PUT /api/resource-requests/:id/status
// @access  Private (Department Admin, Super Admin)
const updateResourceRequestStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected".'
      });
    }

    const resourceRequest = await ResourceRequest.findById(req.params.id).populate('resource');
    if (!resourceRequest) {
      return res.status(404).json({ success: false, message: 'Resource request not found.' });
    }

    const isSuperAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isDeptAdmin = req.user.role === 'hod' || req.user.role === 'department_admin';

    // Authorization: Super Admin OR Dept Admin owning the resource
    if (!isSuperAdmin) {
      if (!isDeptAdmin || resourceRequest.resourceDepartment.toString() !== req.user.department?._id?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are only authorized to approve or reject requests for your department\'s resources.'
        });
      }
    }

    if (status === 'approved') {
      // Re-verify conflict before final approval
      const conflict = await checkResourceConflict({
        resourceId: resourceRequest.resource._id,
        date: resourceRequest.date,
        startTime: resourceRequest.startTime,
        endTime: resourceRequest.endTime,
        excludeBookingId: resourceRequest.booking
      });

      if (conflict.conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `Cannot approve request: ${conflict.message}`,
          details: conflict.conflictingItem,
          alternatives: conflict.alternatives || []
        });
      }

      resourceRequest.status = 'approved';
      resourceRequest.approvedBy = req.user._id;
      resourceRequest.approvedAt = new Date();
      resourceRequest.remarks = remarks || 'Request approved by department administrator.';

      // Ensure confirmed Booking exists and is approved
      if (resourceRequest.booking) {
        await Booking.findByIdAndUpdate(resourceRequest.booking, {
          status: 'approved',
          approvedBy: req.user._id,
          approvedAt: new Date(),
          remarks: resourceRequest.remarks
        });
      } else {
        const booking = await Booking.create({
          resource: resourceRequest.resource._id,
          requestedBy: resourceRequest.requestedBy,
          bookedBy: resourceRequest.requestedBy,
          department: resourceRequest.requestingDepartment,
          request: resourceRequest._id,
          title: resourceRequest.title,
          purpose: resourceRequest.purpose,
          date: resourceRequest.date,
          startTime: resourceRequest.startTime,
          endTime: resourceRequest.endTime,
          status: 'approved',
          approvedBy: req.user._id,
          approvedAt: new Date(),
          remarks: resourceRequest.remarks
        });
        resourceRequest.booking = booking._id;
      }

      await resourceRequest.save();

      // Notify Requester
      await Notification.create({
        user: resourceRequest.requestedBy,
        title: 'Resource Request Approved',
        message: `Your booking request for "${resourceRequest.resource.name}" on ${resourceRequest.date} (${resourceRequest.startTime}-${resourceRequest.endTime}) has been approved.`,
        type: 'booking_approved',
        link: '/my-bookings'
      });
    } else {
      // Rejected
      resourceRequest.status = 'rejected';
      resourceRequest.rejectedBy = req.user._id;
      resourceRequest.rejectedAt = new Date();
      resourceRequest.remarks = remarks || 'Request was declined by department administrator.';

      if (resourceRequest.booking) {
        await Booking.findByIdAndUpdate(resourceRequest.booking, {
          status: 'rejected',
          remarks: resourceRequest.remarks
        });
      }

      await resourceRequest.save();

      // Notify Requester
      await Notification.create({
        user: resourceRequest.requestedBy,
        title: 'Resource Request Rejected',
        message: `Your booking request for "${resourceRequest.resource.name}" on ${resourceRequest.date} was rejected. Remarks: ${resourceRequest.remarks}`,
        type: 'booking_rejected',
        link: '/my-bookings'
      });
    }

    await logAudit({
      action: status === 'approved' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: resourceRequest._id,
      details: {
        resourceName: resourceRequest.resource.name,
        date: resourceRequest.date,
        time: `${resourceRequest.startTime}-${resourceRequest.endTime}`,
        status,
        remarks: resourceRequest.remarks
      }
    });

    const updated = await ResourceRequest.findById(resourceRequest._id)
      .populate('resource')
      .populate('requestedBy', 'name email department')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');

    res.json({
      success: true,
      message: `Resource request has been ${status} successfully.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a resource request (by requester or Admin)
// @route   PUT /api/resource-requests/:id/cancel
// @access  Private
const cancelResourceRequest = async (req, res, next) => {
  try {
    const resourceRequest = await ResourceRequest.findById(req.params.id).populate('resource');
    if (!resourceRequest) {
      return res.status(404).json({ success: false, message: 'Resource request not found.' });
    }

    const isSuperAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isSuperAdmin && resourceRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request.' });
    }

    resourceRequest.status = 'cancelled';
    resourceRequest.remarks = req.body.remarks || 'Cancelled by requester';
    await resourceRequest.save();

    if (resourceRequest.booking) {
      await Booking.findByIdAndUpdate(resourceRequest.booking, {
        status: 'cancelled',
        remarks: resourceRequest.remarks
      });
    }

    await logAudit({
      action: 'RESOURCE_REQUEST_CANCELLED',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: resourceRequest._id,
      details: { resourceName: resourceRequest.resource.name, date: resourceRequest.date }
    });

    res.json({
      success: true,
      message: 'Resource request cancelled successfully.',
      data: resourceRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  updateResourceRequestStatus,
  cancelResourceRequest
};
