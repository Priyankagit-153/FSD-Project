const Material = require('../models/Material');
const path = require('path');
const fs = require('fs');
const { logAudit } = require('../utils/auditLogger');

// @desc    Upload academic material
// @route   POST /api/materials
// @access  Private (Faculty, HOD, Admin)
const uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const { title, subject, department, type } = req.body;

    if (!title || !subject || !type) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Please provide title, subject, and material type.' });
    }

    const deptId = department || req.user.department?._id;
    if (!deptId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }

    const material = await Material.create({
      title,
      subject,
      department: deptId,
      type,
      filePath: req.file.path,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    });

    await logAudit({
      action: 'MATERIAL_UPLOADED',
      performedBy: req.user._id,
      entityType: 'Material',
      entityId: material._id,
      details: {
        title,
        subject,
        type,
        fileName: req.file.originalname,
        size: req.file.size
      }
    });

    const populated = await Material.findById(material._id)
      .populate('department', 'name code')
      .populate('uploadedBy', 'name email department');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all materials with filters & search
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res, next) => {
  try {
    const { department, type, subject, search } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }
    if (type) {
      query.type = type;
    }
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    const materials = await Material.find(query)
      .populate('department', 'name code')
      .populate('uploadedBy', 'name email designation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download material file
// @route   GET /api/materials/:id/download
// @access  Private
const downloadMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server storage.' });
    }

    material.downloads += 1;
    await material.save();

    res.download(material.filePath, material.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material (uploader or admin)
// @route   DELETE /api/materials/:id
// @access  Private
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    // Role check: Admin or owner can delete
    if (req.user.role !== 'admin' && material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are only authorized to delete your own uploads.' });
    }

    // Remove file from disk
    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }

    await material.deleteOne();

    await logAudit({
      action: 'MATERIAL_DELETED',
      performedBy: req.user._id,
      entityType: 'Material',
      entityId: req.params.id,
      details: { title: material.title, fileName: material.originalName }
    });

    res.json({
      success: true,
      message: 'Material removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMaterial,
  getMaterials,
  downloadMaterial,
  deleteMaterial
};
