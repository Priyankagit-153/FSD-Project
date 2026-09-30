const express = require('express');
const router = express.Router();
const {
  uploadMaterial,
  getMaterials,
  downloadMaterial,
  deleteMaterial
} = require('../controllers/materialController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getMaterials)
  .post(protect, upload.single('file'), uploadMaterial);

router.get('/:id/download', protect, downloadMaterial);
router.delete('/:id', protect, deleteMaterial);

module.exports = router;
