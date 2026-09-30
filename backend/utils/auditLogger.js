const AuditLog = require('../models/AuditLog');

const logAudit = async ({ action, performedBy, entityType, entityId, details }) => {
  try {
    await AuditLog.create({
      action,
      performedBy: performedBy || null,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      details: details || {}
    });
  } catch (err) {
    console.error('[AuditLog] Failed to log action:', err.message);
  }
};

module.exports = { logAudit };
