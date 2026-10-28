const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('../backend/config/db');
const { runSeed } = require('../backend/config/seedData');
const errorHandler = require('../backend/middleware/errorHandler');

// Route imports
const authRoutes = require('../backend/routes/authRoutes');
const departmentRoutes = require('../backend/routes/departmentRoutes');
const userRoutes = require('../backend/routes/userRoutes');
const resourceRoutes = require('../backend/routes/resourceRoutes');
const bookingRoutes = require('../backend/routes/bookingRoutes');
const examRoutes = require('../backend/routes/examRoutes');
const materialRoutes = require('../backend/routes/materialRoutes');
const notificationRoutes = require('../backend/routes/notificationRoutes');
const auditLogRoutes = require('../backend/routes/auditLogRoutes');
const reportRoutes = require('../backend/routes/reportRoutes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Inter-Departmental Planning & Resource Sharing Platform',
    institution: 'Department of CSE, Easwari Engineering College',
    environment: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

let isInitialized = false;

// Middleware to ensure DB connection and auto-seeding
app.use(async (req, res, next) => {
  try {
    const conn = await connectDB();
    if (conn && !isInitialized) {
      await runSeed();
      isInitialized = true;
    }
    next();
  } catch (err) {
    console.error('Serverless DB Error:', err);
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/reports', reportRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
