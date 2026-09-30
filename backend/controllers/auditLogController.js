const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs with filters (Admin only)
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, startDate, endDate, limit = 100 } = req.query;
    let query = {};

    if (action) {
      query.action = { $regex: action, $options: 'i' };
    }
    if (entityType) {
      query.entityType = entityType;
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email role department')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
