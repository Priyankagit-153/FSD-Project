const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const Department = require('../models/Department');
const Exam = require('../models/Exam');
const Material = require('../models/Material');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userRole = req.user.role;
    const userDeptId = req.user.department?._id;

    // Faculty specific dashboard
    if (userRole === 'faculty') {
      const myBookingsCount = await Booking.countDocuments({ requestedBy: req.user._id });
      const pendingBookingsCount = await Booking.countDocuments({ requestedBy: req.user._id, status: 'pending' });
      const approvedBookingsCount = await Booking.countDocuments({ requestedBy: req.user._id, status: 'approved' });
      const myDutiesCount = await Exam.countDocuments({ invigilators: req.user._id });

      const upcomingBookings = await Booking.find({
        requestedBy: req.user._id,
        date: { $gte: today }
      })
        .populate('resource')
        .sort({ date: 1, startTime: 1 })
        .limit(5);

      const upcomingDuties = await Exam.find({
        invigilators: req.user._id,
        date: { $gte: today }
      })
        .populate('rooms', 'name location')
        .sort({ date: 1, startTime: 1 })
        .limit(5);

      return res.json({
        success: true,
        stats: {
          myBookingsCount,
          pendingBookingsCount,
          approvedBookingsCount,
          myDutiesCount,
          upcomingBookings,
          upcomingDuties
        }
      });
    }

    // Admin & HOD dashboard stats
    let resourceFilter = {};
    let bookingFilter = {};

    if (userRole === 'hod' && userDeptId) {
      resourceFilter.department = userDeptId;
      // Find resources for this HOD
      const deptResources = await Resource.find({ department: userDeptId }).select('_id');
      const resIds = deptResources.map(r => r._id);
      bookingFilter.resource = { $in: resIds };
    }

    const totalResources = await Resource.countDocuments(resourceFilter);
    const bookingsToday = await Booking.countDocuments({
      ...bookingFilter,
      date: today
    });
    const pendingRequests = await Booking.countDocuments({
      ...bookingFilter,
      status: 'pending'
    });
    const approvedRequests = await Booking.countDocuments({
      ...bookingFilter,
      status: 'approved'
    });
    const rejectedRequests = await Booking.countDocuments({
      ...bookingFilter,
      status: 'rejected'
    });

    const totalDecided = approvedRequests + rejectedRequests;
    const approvalRate = totalDecided > 0 ? Math.round((approvedRequests / totalDecided) * 100) : 100;

    // Bookings per Department (for charts)
    const departments = await Department.find();
    const bookingsByDeptData = [];
    for (const dept of departments) {
      const count = await Booking.countDocuments({ department: dept._id });
      bookingsByDeptData.push({
        department: dept.code,
        name: dept.name,
        count
      });
    }

    // Resources Utilization by Type
    const resourceTypes = ['classroom', 'lab', 'seminar hall', 'projector', 'equipment'];
    const utilizationByType = [];
    for (const type of resourceTypes) {
      const resourcesOfType = await Resource.find({ type, ...resourceFilter }).select('_id');
      const resIds = resourcesOfType.map(r => r._id);
      const bookingsCount = await Booking.countDocuments({ resource: { $in: resIds }, status: 'approved' });
      utilizationByType.push({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: resourcesOfType.length,
        bookings: bookingsCount
      });
    }

    // Most Used Resources
    const topResourcesAggregate = await Booking.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$resource', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ]);

    const topResources = [];
    for (const item of topResourcesAggregate) {
      const resDoc = await Resource.findById(item._id).populate('department', 'code');
      if (resDoc) {
        topResources.push({
          id: resDoc._id,
          name: resDoc.name,
          type: resDoc.type,
          department: resDoc.department?.code || 'N/A',
          totalBookings: item.totalBookings
        });
      }
    }

    const recentBookings = await Booking.find(bookingFilter)
      .populate('resource')
      .populate('requestedBy', 'name email')
      .populate('department', 'code')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        totalResources,
        bookingsToday,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        approvalRate,
        bookingsByDeptData,
        utilizationByType,
        topResources,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export bookings to CSV
// @route   GET /api/reports/export-bookings
// @access  Private/Admin
const exportBookingsCSV = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('resource', 'name type location')
      .populate('requestedBy', 'name email')
      .populate('department', 'name code')
      .populate('approvedBy', 'name email')
      .sort({ date: -1, startTime: -1 });

    const headers = [
      'Booking ID',
      'Purpose / Title',
      'Resource Name',
      'Resource Type',
      'Location',
      'Department',
      'Requested By',
      'Requester Email',
      'Date',
      'Start Time',
      'End Time',
      'Status',
      'Remarks',
      'Approved By',
      'Created At'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = bookings.map(b => [
      escapeCsv(b._id),
      escapeCsv(b.title),
      escapeCsv(b.resource?.name || 'N/A'),
      escapeCsv(b.resource?.type || 'N/A'),
      escapeCsv(b.resource?.location || 'N/A'),
      escapeCsv(b.department?.code || 'N/A'),
      escapeCsv(b.requestedBy?.name || 'N/A'),
      escapeCsv(b.requestedBy?.email || 'N/A'),
      escapeCsv(b.date),
      escapeCsv(b.startTime),
      escapeCsv(b.endTime),
      escapeCsv(b.status),
      escapeCsv(b.remarks || ''),
      escapeCsv(b.approvedBy?.name || ''),
      escapeCsv(b.createdAt ? b.createdAt.toISOString() : '')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="easwari_bookings_report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Export resource utilization to CSV
// @route   GET /api/reports/export-utilization
// @access  Private/Admin
const exportUtilizationCSV = async (req, res, next) => {
  try {
    const resources = await Resource.find().populate('department', 'name code');

    const headers = [
      'Resource ID',
      'Resource Name',
      'Type',
      'Department',
      'Capacity',
      'Location',
      'Status',
      'Approved Bookings Count',
      'Total Booked Hours'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = [];
    for (const resItem of resources) {
      const bookings = await Booking.find({ resource: resItem._id, status: 'approved' });
      
      let totalMinutes = 0;
      bookings.forEach(b => {
        if (b.startTime && b.endTime) {
          const [sH, sM] = b.startTime.split(':').map(Number);
          const [eH, eM] = b.endTime.split(':').map(Number);
          const duration = (eH * 60 + eM) - (sH * 60 + sM);
          if (duration > 0) totalMinutes += duration;
        }
      });
      const hours = (totalMinutes / 60).toFixed(1);

      rows.push([
        escapeCsv(resItem._id),
        escapeCsv(resItem.name),
        escapeCsv(resItem.type),
        escapeCsv(resItem.department?.code || 'N/A'),
        escapeCsv(resItem.capacity),
        escapeCsv(resItem.location),
        escapeCsv(resItem.isActive ? 'Active' : 'Inactive'),
        escapeCsv(bookings.length),
        escapeCsv(hours)
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="easwari_resource_utilization.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  exportBookingsCSV,
  exportUtilizationCSV
};
