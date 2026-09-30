const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  exportBookingsCSV,
  exportUtilizationCSV
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/export-bookings', protect, authorize('admin'), exportBookingsCSV);
router.get('/export-utilization', protect, authorize('admin'), exportUtilizationCSV);

module.exports = router;
