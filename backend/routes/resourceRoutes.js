const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  checkAvailability,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getResources)
  .post(protect, authorize('admin', 'hod'), createResource);

router.post('/:id/check-availability', protect, checkAvailability);

router.route('/:id')
  .get(getResourceById)
  .put(protect, authorize('admin', 'hod'), updateResource)
  .delete(protect, authorize('admin', 'hod'), deleteResource);

module.exports = router;
