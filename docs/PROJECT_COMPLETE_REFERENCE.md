# COMPLETE SOURCE CODE & ARCHITECTURE REFERENCE
### Project: Inter-Departmental Planning & Resource Sharing Platform
### Department of CSE, Easwari Engineering College

This document contains the complete folder hierarchy and full source code of all core backend and frontend files.

## 📁 COMPLETE FOLDER HIERARCHY
```
resource_sharing_platform/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── seedData.js
│   ├── controllers/
│   │   ├── auditLogController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── departmentController.js
│   │   ├── examController.js
│   │   ├── materialController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   ├── resourceController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── AuditLog.js
│   │   ├── Booking.js
│   │   ├── Department.js
│   │   ├── Exam.js
│   │   ├── Material.js
│   │   ├── Notification.js
│   │   ├── Resource.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auditLogRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── examRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── auditLogger.js
│   │   └── conflictChecker.js
│   ├── uploads/
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AcademicHub.jsx
│   │   │   ├── Approvals.jsx
│   │   │   ├── AuditLogs.jsx
│   │   │   ├── BookResource.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Exams.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ResourceDetail.jsx
│   │   │   ├── Resources.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
├── package.json
└── README.md
```


---

## 📄 File: `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const userRoutes = require('./routes/userRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const examRoutes = require('./routes/examRoutes');
const materialRoutes = require('./routes/materialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Inter-Departmental Planning & Resource Sharing Platform',
    institution: 'Department of CSE, Easwari Engineering College',
    timestamp: new Date().toISOString()
  });
});

// API Routes
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

// 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const { runSeed } = require('./config/seedData');

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    await runSeed();
    const server = app.listen(PORT, () => {
      console.log('========================================================');
      console.log(`[Server] Running on port ${PORT}`);
      console.log('[Institution] Department of CSE, Easwari Engineering College');
      console.log('[System] Inter-Departmental Planning & Resource Sharing Platform');
      console.log('========================================================');
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[Server Unhandled Rejection] ${err.message}`);
    });
  } catch (err) {
    console.error(`[Server Startup Error] ${err.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;

```

---

## 📄 File: `backend/config/db.js`

```javascript
const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes('PASTE_YOUR_ATLAS_CONNECTION_STRING_HERE');

  if (!isPlaceholder) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[Database] Connected to MongoDB Atlas: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[Database] Failed to connect to MongoDB Atlas at ${uri}: ${err.message}`);
      console.log('[Database] Falling back to MongoDB Memory Server for local development...');
    }
  } else {
    console.log('[Database] MONGO_URI contains placeholder. Initializing local MongoDB Memory Server...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'resource_sharing_platform'
      }
    });
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to in-memory MongoDB at: ${memoryUri}`);
    console.log('[Database] Note: To persist to MongoDB Atlas, add your Atlas connection string to backend/.env');
    return conn;
  } catch (memErr) {
    console.error(`[Database] Critical: Could not connect to MongoDB: ${memErr.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };

```

---

## 📄 File: `backend/models/User.js`

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin', 'department_admin', 'hod', 'faculty', 'student'],
    default: 'faculty'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function () {
      return this.role !== 'admin' && this.role !== 'super_admin';
    }
  },
  studentId: {
    type: String,
    trim: true,
    default: ''
  },
  employeeId: {
    type: String,
    trim: true,
    default: ''
  },
  designation: {
    type: String,
    default: 'Assistant Professor'
  },
  phone: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

```

---

## 📄 File: `backend/models/Department.js`

```javascript
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    trim: true,
    uppercase: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);

```

---

## 📄 File: `backend/models/Resource.js`

```javascript
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: [
      'classroom',
      'laboratory',
      'lab',
      'seminar hall',
      'conference room',
      'auditorium',
      'projector',
      'computer',
      'camera',
      'iot kit',
      'sensor',
      'lab equipment',
      'equipment',
      'other'
    ],
    lowercase: true
  },
  category: {
    type: String,
    enum: ['Infrastructure', 'Equipment', 'Academic Resources', 'Human Resources'],
    default: 'Infrastructure'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department owner is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    default: 0,
    min: 0
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  features: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'maintenance', 'allocated', 'inactive'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);

```

---

## 📄 File: `backend/models/Booking.js`

```javascript
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Resource is required']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user is required']
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceRequest',
    default: null
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  title: {
    type: String,
    required: [true, 'Booking title/purpose is required'],
    trim: true
  },
  purpose: {
    type: String,
    default: '',
    trim: true
  },
  date: {
    type: String, // Stored as YYYY-MM-DD string for exact calendar day comparison
    required: [true, 'Date is required']
  },
  startTime: {
    type: String, // Stored as "HH:mm" e.g., "09:00"
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // Stored as "HH:mm" e.g., "11:00"
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  remarks: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for conflict lookup performance
bookingSchema.index({ resource: 1, date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

```

---

## 📄 File: `backend/models/Exam.js`

```javascript
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  semester: {
    type: String,
    default: '5'
  },
  section: {
    type: String,
    default: 'A'
  },
  date: {
    type: String, // Stored as YYYY-MM-DD
    required: [true, 'Exam date is required']
  },
  startTime: {
    type: String, // HH:mm
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // HH:mm
    required: [true, 'End time is required']
  },
  studentCount: {
    type: Number,
    default: 60,
    min: 1
  },
  totalStudents: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  description: {
    type: String,
    default: ''
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  invigilators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  seatsPerRoom: {
    type: Number,
    default: 30
  },
  roomAllocations: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    assignedInvigilator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    allottedSeats: {
      type: Number,
      default: 30
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);

```

---

## 📄 File: `backend/models/Material.js`

```javascript
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Material title is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  description: {
    type: String,
    default: ''
  },
  semester: {
    type: String,
    default: '5'
  },
  type: {
    type: String,
    enum: ['notes', 'lab manual', 'question bank', 'dataset', 'research', 'research paper', 'project material'],
    required: [true, 'Material type is required']
  },
  category: {
    type: String,
    enum: ['notes', 'lab manual', 'question bank', 'dataset', 'research', 'research paper', 'project material'],
    default: 'notes'
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'department', 'faculty_only'],
    default: 'public'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);

```

---

## 📄 File: `backend/models/Notification.js`

```javascript
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Notification'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_request',
      'booking_approved',
      'booking_rejected',
      'booking_cancelled',
      'exam_duty',
      'exam_published',
      'seat_allocated',
      'resource_uploaded',
      'general'
    ],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

notificationSchema.pre('save', function (next) {
  if (this.isModified('read')) {
    this.isRead = this.read;
  } else if (this.isModified('isRead')) {
    this.read = this.isRead;
  }
  next();
});

notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

```

---

## 📄 File: `backend/models/AuditLog.js`

```javascript
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Booking', 'Exam', 'Resource', 'Material', 'User', 'Department', 'Auth']
  },
  entityId: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

auditLogSchema.index({ timestamp: -1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

```

---

## 📄 File: `backend/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development');

      req.user = await User.findById(decoded.id).select('-password').populate('department');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.'
        });
      }

      next();
    } catch (err) {
      console.error('Auth verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please authenticate.'
      });
    }

    const userRole = req.user.role;
    const hasRole = roles.some(role => {
      if (role === userRole) return true;
      if ((role === 'admin' || role === 'super_admin') && (userRole === 'admin' || userRole === 'super_admin')) return true;
      if ((role === 'hod' || role === 'department_admin') && (userRole === 'hod' || userRole === 'department_admin')) return true;
      return false;
    });

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

```

---

## 📄 File: `backend/middleware/upload.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  }
});

// File filter (pdf, doc, docx, ppt, pptx, zip, txt, xlsx)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx|ppt|pptx|zip|rar|txt|csv|xlsx|xls/i;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files (PDF, DOC, DOCX, PPT, PPTX, ZIP, etc.) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;

```

---

## 📄 File: `backend/middleware/errorHandler.js`

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${field}. Please use another value!`;
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size is too large. Maximum allowed size is 10MB.';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;

```

---

## 📄 File: `backend/utils/conflictChecker.js`

```javascript
const Booking = require('../models/Booking');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Resource = require('../models/Resource');
const StudentExamAllocation = require('../models/StudentExamAllocation');

/**
 * Convert HH:mm string to minutes from start of day
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Checks if two time intervals overlap (strictly existing.startTime < requested.endTime && existing.endTime > requested.startTime)
 */
const isTimeOverlapping = (startA, endA, startB, endB) => {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return sA < eB && eA > sB;
};

/**
 * Find alternative resources of similar type/category that are available at the given date/time
 */
const findAlternativeResources = async ({ resourceId, date, startTime, endTime, limit = 3 }) => {
  try {
    const targetResource = await Resource.findById(resourceId);
    if (!targetResource) return [];

    // Search for resources with matching type or category, excluding current resource
    const candidates = await Resource.find({
      _id: { $ne: resourceId },
      isActive: true,
      $or: [
        { type: targetResource.type },
        { category: targetResource.category }
      ]
    }).populate('department', 'name code');

    const available = [];
    for (const candidate of candidates) {
      const conflict = await checkResourceConflictRaw({
        resourceId: candidate._id,
        date,
        startTime,
        endTime
      });

      if (!conflict.conflict) {
        available.push({
          _id: candidate._id,
          name: candidate.name,
          type: candidate.type,
          category: candidate.category,
          capacity: candidate.capacity,
          location: candidate.location,
          department: candidate.department
        });
        if (available.length >= limit) break;
      }
    }

    return available;
  } catch (err) {
    console.error('Error finding alternative resources:', err);
    return [];
  }
};

/**
 * Raw conflict check without recursive alternative search
 */
const checkResourceConflictRaw = async ({
  resourceId,
  date,
  startTime,
  endTime,
  excludeBookingId = null,
  excludeExamId = null
}) => {
  // 1. Check existing Approved Bookings
  const bookingQuery = {
    resource: resourceId,
    date: date,
    status: 'approved'
  };
  if (excludeBookingId) {
    bookingQuery._id = { $ne: excludeBookingId };
  }

  const existingBookings = await Booking.find(bookingQuery)
    .populate('requestedBy', 'name email')
    .populate('resource', 'name location');

  for (const booking of existingBookings) {
    if (isTimeOverlapping(startTime, endTime, booking.startTime, booking.endTime)) {
      return {
        conflict: true,
        type: 'booking',
        message: `Resource is already booked by ${booking.requestedBy ? booking.requestedBy.name : 'Faculty'} for "${booking.title}" from ${booking.startTime} to ${booking.endTime} on ${date}.`,
        conflictingItem: booking
      };
    }
  }

  // 2. Check scheduled Exams occupying this resource
  const examQuery = {
    rooms: resourceId,
    date: date
  };
  if (excludeExamId) {
    examQuery._id = { $ne: excludeExamId };
  }

  const existingExams = await Exam.find(examQuery).populate('rooms', 'name location');

  for (const exam of existingExams) {
    if (isTimeOverlapping(startTime, endTime, exam.startTime, exam.endTime)) {
      return {
        conflict: true,
        type: 'exam',
        message: `Resource is reserved for exam "${exam.name}" (${exam.subject}) from ${exam.startTime} to ${exam.endTime} on ${date}.`,
        conflictingItem: exam
      };
    }
  }

  return { conflict: false };
};

/**
 * Check if a resource has an approved booking or exam scheduled at the given date and time,
 * including alternative resource suggestions if a conflict exists.
 */
const checkResourceConflict = async ({
  resourceId,
  date,
  startTime,
  endTime,
  excludeBookingId = null,
  excludeExamId = null
}) => {
  const result = await checkResourceConflictRaw({
    resourceId,
    date,
    startTime,
    endTime,
    excludeBookingId,
    excludeExamId
  });

  if (result.conflict) {
    const alternatives = await findAlternativeResources({
      resourceId,
      date,
      startTime,
      endTime
    });
    result.alternatives = alternatives;
    if (alternatives.length > 0) {
      result.suggestedMessage = `Alternative available resources: ${alternatives.map(a => `${a.name} (${a.department?.code || ''})`).join(', ')}`;
    }
  }

  return result;
};

/**
 * Check if an invigilator is already assigned to another exam at the same date and time
 */
const checkInvigilatorConflict = async ({
  invigilatorId,
  date,
  startTime,
  endTime,
  excludeExamId = null
}) => {
  const examQuery = {
    invigilators: invigilatorId,
    date: date
  };
  if (excludeExamId) {
    examQuery._id = { $ne: excludeExamId };
  }

  const existingExams = await Exam.find(examQuery).populate('invigilators', 'name email');

  for (const exam of existingExams) {
    if (isTimeOverlapping(startTime, endTime, exam.startTime, exam.endTime)) {
      const invigilator = await User.findById(invigilatorId).select('name');
      return {
        conflict: true,
        message: `Faculty member "${invigilator ? invigilator.name : 'Faculty'}" is already assigned as an invigilator for "${exam.name}" (${exam.subject}) from ${exam.startTime} to ${exam.endTime} on ${date}.`,
        conflictingItem: exam
      };
    }
  }

  return { conflict: false };
};

/**
 * Check if a student is already allocated to another exam at the same date and overlapping time
 */
const checkStudentExamConflict = async ({
  studentId,
  date,
  startTime,
  endTime,
  excludeExamId = null
}) => {
  const allocations = await StudentExamAllocation.find({ student: studentId }).populate('exam');

  for (const alloc of allocations) {
    if (!alloc.exam || (excludeExamId && alloc.exam._id.toString() === excludeExamId.toString())) {
      continue;
    }
    if (alloc.exam.date === date && isTimeOverlapping(startTime, endTime, alloc.exam.startTime, alloc.exam.endTime)) {
      return {
        conflict: true,
        message: `Student is already allocated for exam "${alloc.exam.name}" (${alloc.exam.subject}) at ${alloc.exam.startTime}-${alloc.exam.endTime} on ${date}.`,
        conflictingExam: alloc.exam
      };
    }
  }

  return { conflict: false };
};

module.exports = {
  timeToMinutes,
  isTimeOverlapping,
  checkResourceConflict,
  checkInvigilatorConflict,
  checkStudentExamConflict,
  findAlternativeResources
};

```

---

## 📄 File: `backend/utils/auditLogger.js`

```javascript
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

```

---

## 📄 File: `backend/controllers/authController.js`

```javascript
const User = require('../models/User');
const Department = require('../models/Department');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/auditLogger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_development', {
    expiresIn: '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
    }

    // Role safety: default to faculty if not admin/hod, or if trying to create admin without admin auth
    const assignedRole = ['admin', 'hod', 'faculty'].includes(role) ? role : 'faculty';

    let departmentId = department;
    if (assignedRole !== 'admin' && !departmentId) {
      // If no department specified, assign to first available department
      const firstDept = await Department.findOne();
      if (firstDept) departmentId = firstDept._id;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      department: assignedRole === 'admin' ? null : departmentId,
      designation: designation || 'Assistant Professor',
      phone: phone || ''
    });

    await logAudit({
      action: 'USER_REGISTER',
      performedBy: user._id,
      entityType: 'User',
      entityId: user._id,
      details: { name: user.name, email: user.email, role: user.role }
    });

    const populatedUser = await User.findById(user._id).populate('department');

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        department: populatedUser.department,
        designation: populatedUser.designation,
        phone: populatedUser.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('department');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await logAudit({
      action: 'USER_LOGIN',
      performedBy: user._id,
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role }
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.designation = req.body.designation || user.designation;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('department');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};

```

---

## 📄 File: `backend/controllers/bookingController.js`

```javascript
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

```

---

## 📄 File: `backend/controllers/resourceController.js`

```javascript
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const Exam = require('../models/Exam');
const { logAudit } = require('../utils/auditLogger');
const { checkResourceConflict } = require('../utils/conflictChecker');

// @desc    Get all resources with filters & search
// @route   GET /api/resources
// @access  Public / Private
const getResources = async (req, res, next) => {
  try {
    const { department, type, minCapacity, maxCapacity, search, isActive } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }
    if (type) {
      query.type = type.toLowerCase();
    }
    if (minCapacity || maxCapacity) {
      query.capacity = {};
      if (minCapacity) query.capacity.$gte = Number(minCapacity);
      if (maxCapacity) query.capacity.$lte = Number(maxCapacity);
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource with its schedule/availability
// @route   GET /api/resources/:id
// @access  Public / Private
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('department', 'name code');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const { date } = req.query;
    let dateFilter = date || new Date().toISOString().split('T')[0];

    // Fetch approved bookings for this resource on this date
    const bookings = await Booking.find({
      resource: resource._id,
      date: dateFilter,
      status: { $in: ['approved', 'pending'] }
    }).populate('requestedBy', 'name email department');

    // Fetch exams occupying this resource on this date
    const exams = await Exam.find({
      rooms: resource._id,
      date: dateFilter
    }).populate('department', 'name code');

    res.json({
      success: true,
      data: resource,
      schedule: {
        date: dateFilter,
        bookings,
        exams
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check live availability for a resource at a given date/time
// @route   POST /api/resources/:id/check-availability
// @access  Private
const checkAvailability = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;
    const resourceId = req.params.id;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide date, startTime, and endTime' });
    }

    const conflict = await checkResourceConflict({
      resourceId,
      date,
      startTime,
      endTime
    });

    // Also get all bookings/exams for the full day to show time slot status
    const dayBookings = await Booking.find({
      resource: resourceId,
      date: date,
      status: { $in: ['approved', 'pending'] }
    }).populate('requestedBy', 'name email');

    const dayExams = await Exam.find({
      rooms: resourceId,
      date: date
    }).populate('invigilators', 'name');

    res.json({
      success: true,
      available: !conflict.conflict,
      conflictDetails: conflict.conflict ? conflict : null,
      daySchedule: {
        bookings: dayBookings,
        exams: dayExams
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create resource
// @route   POST /api/resources
// @access  Private (Admin or HOD of department)
const createResource = async (req, res, next) => {
  try {
    const { name, type, department, capacity, location, description, features, isActive } = req.body;

    // Authorization check: HOD can only create resources for their own department
    if (req.user.role === 'hod' && req.user.department._id.toString() !== department) {
      return res.status(403).json({
        success: false,
        message: 'HODs can only create resources for their own department'
      });
    }

    const resource = await Resource.create({
      name,
      type,
      department: req.user.role === 'hod' ? req.user.department._id : department,
      capacity: Number(capacity) || 0,
      location,
      description: description || '',
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []),
      isActive: isActive !== undefined ? isActive : true
    });

    await logAudit({
      action: 'RESOURCE_CREATE',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: resource._id,
      details: { name, type, location, department }
    });

    const populated = await Resource.findById(resource._id).populate('department', 'name code');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin or HOD of department)
const updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Authorization check: HOD can only update their department's resources
    if (req.user.role === 'hod' && resource.department.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'HODs can only update resources belonging to their own department'
      });
    }

    const updates = { ...req.body };
    if (updates.features && typeof updates.features === 'string') {
      updates.features = updates.features.split(',').map(f => f.trim());
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('department', 'name code');

    await logAudit({
      action: 'RESOURCE_UPDATE',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: resource._id,
      details: updates
    });

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin or HOD of department)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (req.user.role === 'hod' && resource.department.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'HODs can only delete resources belonging to their own department'
      });
    }

    await resource.deleteOne();

    await logAudit({
      action: 'RESOURCE_DELETE',
      performedBy: req.user._id,
      entityType: 'Resource',
      entityId: req.params.id,
      details: { name: resource.name }
    });

    res.json({
      success: true,
      message: 'Resource removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  checkAvailability,
  createResource,
  updateResource,
  deleteResource
};

```

---

## 📄 File: `backend/controllers/examController.js`

```javascript
const Exam = require('../models/Exam');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ExamAllocation = require('../models/ExamAllocation');
const StudentExamAllocation = require('../models/StudentExamAllocation');
const { logAudit } = require('../utils/auditLogger');
const {
  checkResourceConflict,
  checkInvigilatorConflict,
  checkStudentExamConflict
} = require('../utils/conflictChecker');

// Helper to check roles
const isSuperAdminUser = (user) => user && (user.role === 'admin' || user.role === 'super_admin');
const isDeptAdminUser = (user) => user && (user.role === 'hod' || user.role === 'department_admin');

// @desc    Create exam timetable with room & invigilator conflict validation
// @route   POST /api/exams
// @access  Private (Admin, HOD)
const createExam = async (req, res, next) => {
  try {
    const {
      name,
      subject,
      department,
      semester,
      section,
      date,
      startTime,
      endTime,
      rooms,
      invigilators,
      seatsPerRoom,
      totalStudents,
      studentCount,
      description,
      roomAllocations
    } = req.body;

    if (!name || !subject || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exam name, subject, date, startTime, and endTime.'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'Exam start time must be before end time.'
      });
    }

    const assignedDept = isDeptAdminUser(req.user)
      ? req.user.department?._id
      : (department || req.user.department?._id);

    const roomIds = Array.isArray(rooms) ? rooms : [];
    const invigilatorIds = Array.isArray(invigilators) ? invigilators : [];
    const finalStudentCount = Number(studentCount) || Number(totalStudents) || 60;

    // 1. Validate Room Conflicts
    for (const roomId of roomIds) {
      const roomConflict = await checkResourceConflict({
        resourceId: roomId,
        date,
        startTime,
        endTime
      });

      if (roomConflict.conflict) {
        const roomObj = await Resource.findById(roomId).select('name');
        return res.status(409).json({
          success: false,
          conflict: true,
          type: 'room_conflict',
          message: `Conflict for room "${roomObj ? roomObj.name : roomId}": ${roomConflict.message}`,
          details: roomConflict,
          alternatives: roomConflict.alternatives || []
        });
      }
    }

    // 2. Validate Invigilator Conflicts (prevent faculty double-booking)
    for (const invigilatorId of invigilatorIds) {
      const invigConflict = await checkInvigilatorConflict({
        invigilatorId,
        date,
        startTime,
        endTime
      });

      if (invigConflict.conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          type: 'invigilator_conflict',
          message: invigConflict.message,
          details: invigConflict
        });
      }
    }

    // 3. Compute initial room allocations
    let calculatedAllocations = roomAllocations || [];
    if (!calculatedAllocations || calculatedAllocations.length === 0) {
      const defaultCapacity = Number(seatsPerRoom) || 30;
      calculatedAllocations = roomIds.map((roomId, idx) => ({
        room: roomId,
        assignedInvigilator: invigilatorIds[idx] || null,
        allottedSeats: defaultCapacity
      }));
    }

    const exam = await Exam.create({
      name,
      subject,
      department: assignedDept,
      semester: semester || '5',
      section: section || 'A',
      date,
      startTime,
      endTime,
      studentCount: finalStudentCount,
      totalStudents: finalStudentCount,
      status: 'scheduled',
      description: description || '',
      rooms: roomIds,
      invigilators: invigilatorIds,
      seatsPerRoom: Number(seatsPerRoom) || 30,
      roomAllocations: calculatedAllocations,
      createdBy: req.user._id
    });

    // Create ExamAllocation entries
    for (const alloc of calculatedAllocations) {
      await ExamAllocation.create({
        exam: exam._id,
        room: alloc.room,
        allocatedStudents: alloc.allottedSeats || 30,
        capacityUsed: alloc.allottedSeats || 30,
        invigilators: alloc.assignedInvigilator ? [alloc.assignedInvigilator] : []
      });
    }

    // Notify assigned invigilators
    for (const invigId of invigilatorIds) {
      await Notification.create({
        user: invigId,
        title: 'New Exam Invigilation Duty',
        message: `You have been assigned as invigilator for "${exam.name}" (${exam.subject}) on ${date} from ${startTime} to ${endTime}.`,
        type: 'exam_duty',
        link: '/exams'
      });
    }

    await logAudit({
      action: 'EXAM_TIMETABLE_CREATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: {
        name,
        subject,
        date,
        time: `${startTime}-${endTime}`,
        studentCount: finalStudentCount,
        roomCount: roomIds.length,
        invigilatorCount: invigilatorIds.length
      }
    });

    const populatedExam = await Exam.findById(exam._id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email');

    res.status(201).json({
      success: true,
      message: 'Examination scheduled successfully.',
      data: populatedExam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exams (filterable by department, semester, date, status, search)
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res, next) => {
  try {
    const { department, semester, date, status, search } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }
    if (semester) {
      query.semester = semester;
    }
    if (date) {
      query.date = date;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const exams = await Exam.find(query)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email')
      .populate('createdBy', 'name email');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const allocations = await ExamAllocation.find({ exam: exam._id })
      .populate('room', 'name location capacity')
      .populate('invigilators', 'name email designation');

    const studentAllocations = await StudentExamAllocation.find({ exam: exam._id })
      .populate('student', 'name studentId email')
      .populate('room', 'name location')
      .sort({ seatNumber: 1 });

    res.json({
      success: true,
      data: exam,
      allocations,
      studentAllocations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin, HOD)
const updateExam = async (req, res, next) => {
  try {
    let exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (isDeptAdminUser(req.user) && exam.department.toString() !== req.user.department?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit exams for other departments' });
    }

    const {
      name,
      subject,
      semester,
      section,
      date,
      startTime,
      endTime,
      studentCount,
      totalStudents,
      description,
      status
    } = req.body;

    if (name) exam.name = name;
    if (subject) exam.subject = subject;
    if (semester) exam.semester = semester;
    if (section) exam.section = section;
    if (date) exam.date = date;
    if (startTime) exam.startTime = startTime;
    if (endTime) exam.endTime = endTime;
    if (description !== undefined) exam.description = description;
    if (status) exam.status = status;
    if (studentCount || totalStudents) {
      const sc = Number(studentCount) || Number(totalStudents);
      exam.studentCount = sc;
      exam.totalStudents = sc;
    }

    await exam.save();

    await logAudit({
      action: 'EXAM_UPDATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { name: exam.name, subject: exam.subject, status: exam.status }
    });

    const updated = await Exam.findById(exam._id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email department designation');

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish exam timetable (notifies students and invigilators)
// @route   PUT /api/exams/:id/publish
// @access  Private (Admin, HOD)
const publishExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('department');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.status = 'published';
    await exam.save();

    // Notify all students of the department
    const students = await User.find({
      role: 'student',
      department: exam.department?._id
    });

    for (const std of students) {
      await Notification.create({
        user: std._id,
        title: 'Exam Timetable Published',
        message: `Timetable published for "${exam.name}" (${exam.subject}) on ${exam.date} (${exam.startTime}-${exam.endTime}). Check your seating allocation.`,
        type: 'exam_published',
        link: '/exams'
      });
    }

    // Notify invigilators
    for (const invigId of exam.invigilators) {
      await Notification.create({
        user: invigId,
        title: 'Exam Published - Invigilation Duty Confirmed',
        message: `Duty confirmed for "${exam.name}" on ${exam.date} (${exam.startTime}-${exam.endTime}).`,
        type: 'exam_duty',
        link: '/exams'
      });
    }

    await logAudit({
      action: 'EXAM_PUBLISHED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { name: exam.name, date: exam.date, department: exam.department?.name }
    });

    res.json({
      success: true,
      message: `Exam "${exam.name}" has been published. All eligible students and invigilators notified.`,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Cancel exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin, HOD)
const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (isDeptAdminUser(req.user) && exam.department.toString() !== req.user.department?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'HODs can only delete exams for their own department' });
    }

    // Remove allocations
    await ExamAllocation.deleteMany({ exam: exam._id });
    await StudentExamAllocation.deleteMany({ exam: exam._id });
    await exam.deleteOne();

    await logAudit({
      action: 'EXAM_DELETED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: req.params.id,
      details: { name: exam.name, subject: exam.subject }
    });

    res.json({
      success: true,
      message: 'Exam schedule and allocations deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate rooms & invigilators to an exam
// @route   POST /api/exams/:id/allocate-rooms
// @access  Private (Admin, HOD)
const allocateExamRooms = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const { allocations } = req.body;
    // allocations: [ { roomId, allocatedStudents, invigilatorId } ]

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of room allocations.' });
    }

    const updatedRoomAllocations = [];
    const roomIds = [];
    const invigilatorIds = [];

    // Clear previous allocations
    await ExamAllocation.deleteMany({ exam: exam._id });

    for (const item of allocations) {
      const room = await Resource.findById(item.roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: `Room with ID ${item.roomId} not found.` });
      }

      // Check Room Conflict
      const conflict = await checkResourceConflict({
        resourceId: item.roomId,
        date: exam.date,
        startTime: exam.startTime,
        endTime: exam.endTime,
        excludeExamId: exam._id
      });

      if (conflict.conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `Cannot allocate room "${room.name}": ${conflict.message}`,
          details: conflict.conflictingItem,
          alternatives: conflict.alternatives || []
        });
      }

      // Check Invigilator Conflict if assigned
      if (item.invigilatorId) {
        const invigConflict = await checkInvigilatorConflict({
          invigilatorId: item.invigilatorId,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          excludeExamId: exam._id
        });

        if (invigConflict.conflict) {
          return res.status(409).json({
            success: false,
            conflict: true,
            message: invigConflict.message,
            details: invigConflict
          });
        }
        invigilatorIds.push(item.invigilatorId);
      }

      const seatsAllocated = Number(item.allocatedStudents) || Math.min(room.capacity || 30, 40);

      const allocationDoc = await ExamAllocation.create({
        exam: exam._id,
        room: room._id,
        allocatedStudents: seatsAllocated,
        capacityUsed: seatsAllocated,
        invigilators: item.invigilatorId ? [item.invigilatorId] : []
      });

      updatedRoomAllocations.push({
        room: room._id,
        assignedInvigilator: item.invigilatorId || null,
        allottedSeats: seatsAllocated
      });

      roomIds.push(room._id);
    }

    exam.rooms = roomIds;
    exam.invigilators = invigilatorIds;
    exam.roomAllocations = updatedRoomAllocations;
    await exam.save();

    await logAudit({
      action: 'EXAM_ROOMS_ALLOCATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { exam: exam.name, roomCount: roomIds.length, invigilatorCount: invigilatorIds.length }
    });

    const populatedExam = await Exam.findById(exam._id)
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity type')
      .populate('invigilators', 'name email designation')
      .populate('roomAllocations.room', 'name location capacity')
      .populate('roomAllocations.assignedInvigilator', 'name email');

    res.json({
      success: true,
      message: 'Exam rooms and invigilators allocated successfully with conflict verification.',
      data: populatedExam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-generate sequential student seat allocation across allocated exam rooms
// @route   POST /api/exams/:id/allocate-seats
// @access  Private (Admin, HOD)
const allocateStudentSeats = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('rooms')
      .populate('roomAllocations.room');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (!exam.roomAllocations || exam.roomAllocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No rooms allocated for this exam yet. Please allocate rooms first.'
      });
    }

    // Clear prior student allocations
    await StudentExamAllocation.deleteMany({ exam: exam._id });

    // Fetch enrolled students of this department (or general student users)
    let students = await User.find({
      role: 'student',
      $or: [
        { department: exam.department },
        { department: null }
      ]
    }).sort({ studentId: 1, name: 1 });

    if (students.length === 0) {
      // Fallback: fetch any active students in system
      students = await User.find({ role: 'student' }).sort({ name: 1 });
    }

    const createdAllocations = [];
    let studentIndex = 0;
    const totalStudentsToSeat = Math.min(exam.studentCount || exam.totalStudents || 60, students.length);

    // Sequential seating loop: Room by Room, Seat 1..N
    for (const alloc of exam.roomAllocations) {
      const room = alloc.room;
      const capacity = alloc.allottedSeats || room.capacity || 30;

      for (let seat = 1; seat <= capacity && studentIndex < totalStudentsToSeat; seat++) {
        const student = students[studentIndex];

        // Check if student has an overlapping exam
        const conflict = await checkStudentExamConflict({
          studentId: student._id,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          excludeExamId: exam._id
        });

        if (!conflict.conflict) {
          const seatDoc = await StudentExamAllocation.create({
            exam: exam._id,
            student: student._id,
            room: room._id,
            seatNumber: seat,
            rollNumber: student.studentId || `EEC-26-CS${100 + studentIndex}`
          });
          createdAllocations.push(seatDoc);

          // Notify student
          await Notification.create({
            user: student._id,
            title: 'Exam Seat Allocated',
            message: `Seat #${seat} in ${room.name} (${room.location}) assigned for "${exam.name}" on ${exam.date}.`,
            type: 'seat_allocated',
            link: '/exams'
          });
        }

        studentIndex++;
      }
    }

    await logAudit({
      action: 'STUDENT_SEATS_ALLOCATED',
      performedBy: req.user._id,
      entityType: 'Exam',
      entityId: exam._id,
      details: { exam: exam.name, totalSeated: createdAllocations.length }
    });

    res.json({
      success: true,
      message: `Successfully allocated seats for ${createdAllocations.length} students across ${exam.roomAllocations.length} examination halls.`,
      count: createdAllocations.length,
      data: createdAllocations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's personal exam schedule & allocated seating
// @route   GET /api/exams/my-schedule
// @access  Private (Student)
const getMySchedule = async (req, res, next) => {
  try {
    // Find all student allocations for logged in student
    const allocations = await StudentExamAllocation.find({ student: req.user._id })
      .populate({
        path: 'exam',
        populate: { path: 'department', select: 'name code' }
      })
      .populate('room', 'name location capacity type')
      .sort({ createdAt: -1 });

    const schedule = allocations.map(a => ({
      allocationId: a._id,
      seatNumber: a.seatNumber,
      rollNumber: a.rollNumber,
      room: a.room,
      exam: a.exam
    }));

    res.json({
      success: true,
      count: schedule.length,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invigilation duties for logged-in faculty
// @route   GET /api/exams/my-duties
// @access  Private
const getMyDuties = async (req, res, next) => {
  try {
    const exams = await Exam.find({
      invigilators: req.user._id
    })
      .populate('department', 'name code')
      .populate('rooms', 'name location capacity')
      .populate('roomAllocations.room', 'name location')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invigilator assignments across campus (Admin view)
// @route   GET /api/exams/invigilators/all
// @access  Private (Admin, HOD)
const getAllInvigilators = async (req, res, next) => {
  try {
    const exams = await Exam.find()
      .populate('invigilators', 'name email department designation phone employeeId')
      .populate('department', 'name code')
      .populate('rooms', 'name location')
      .populate('roomAllocations.room', 'name location')
      .populate('roomAllocations.assignedInvigilator', 'name email designation department')
      .sort({ date: 1, startTime: 1 });

    const assignments = [];
    for (const ex of exams) {
      for (const invig of ex.invigilators || []) {
        // Find assigned room if mapped
        const allocation = (ex.roomAllocations || []).find(
          ra => ra.assignedInvigilator && ra.assignedInvigilator._id?.toString() === invig._id?.toString()
        );

        assignments.push({
          examId: ex._id,
          examName: ex.name,
          subject: ex.subject,
          department: ex.department,
          date: ex.date,
          startTime: ex.startTime,
          endTime: ex.endTime,
          status: ex.status,
          faculty: invig,
          room: allocation ? allocation.room : (ex.rooms?.[0] || null)
        });
      }
    }

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  publishExam,
  deleteExam,
  allocateExamRooms,
  allocateStudentSeats,
  getMySchedule,
  getMyDuties,
  getAllInvigilators
};

```

---

## 📄 File: `backend/controllers/materialController.js`

```javascript
const Material = require('../models/Material');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');
const { logAudit } = require('../utils/auditLogger');

// @desc    Upload academic material / resource
// @route   POST /api/materials (or /api/academic-resources)
// @access  Private (Faculty, HOD, Admin)
const uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const { title, subject, department, type, category, semester, description, visibility } = req.body;

    const resourceType = category || type || 'notes';

    if (!title || !subject) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Please provide title and subject.' });
    }

    const deptId = department || req.user.department?._id;
    if (!deptId) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }

    const material = await Material.create({
      title,
      description: description || '',
      subject,
      semester: semester || '5',
      department: deptId,
      type: resourceType,
      category: resourceType,
      filePath: req.file.path,
      originalName: req.file.originalname,
      fileName: req.file.filename || req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileType: req.file.mimetype,
      visibility: visibility || 'public',
      uploadedBy: req.user._id
    });

    // Notify students of the department about new academic resource
    const students = await User.find({
      role: 'student',
      department: deptId
    }).select('_id');

    for (const std of students.slice(0, 20)) {
      await Notification.create({
        user: std._id,
        title: 'New Academic Resource Available',
        message: `New ${resourceType} uploaded: "${title}" for ${subject}.`,
        type: 'resource_uploaded',
        link: '/academic-hub'
      });
    }

    await logAudit({
      action: 'MATERIAL_UPLOADED',
      performedBy: req.user._id,
      entityType: 'Material',
      entityId: material._id,
      details: {
        title,
        subject,
        category: resourceType,
        fileName: req.file.originalname,
        size: req.file.size
      }
    });

    const populated = await Material.findById(material._id)
      .populate('department', 'name code')
      .populate('uploadedBy', 'name email department designation');

    res.status(201).json({
      success: true,
      message: 'Academic resource uploaded successfully.',
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
// @route   GET /api/materials (or /api/academic-resources)
// @access  Private
const getMaterials = async (req, res, next) => {
  try {
    const { department, type, category, semester, subject, search } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }
    const catFilter = category || type;
    if (catFilter) {
      query.$or = [{ type: catFilter }, { category: catFilter }];
    }
    if (semester) {
      query.semester = semester;
    }
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based visibility check: Students only see public or their department materials
    if (req.user.role === 'student') {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'department', department: req.user.department?._id }
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

    const isSuperAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    // Role check: Admin or owner can delete
    if (!isSuperAdmin && material.uploadedBy.toString() !== req.user._id.toString()) {
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

```

---

## 📄 File: `backend/controllers/reportController.js`

```javascript
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

```

---

## 📄 File: `frontend/src/App.jsx`

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import BookResource from './pages/BookResource';
import MyBookings from './pages/MyBookings';
import Approvals from './pages/Approvals';
import CalendarView from './pages/CalendarView';
import Exams from './pages/Exams';
import AcademicHub from './pages/AcademicHub';
import NotificationsPage from './pages/NotificationsPage';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/book-resource" element={<BookResource />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute allowedRoles={['admin', 'hod']}>
                  <Approvals />
                </ProtectedRoute>
              }
            />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/academic-hub" element={<AcademicHub />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

```

---

## 📄 File: `frontend/src/context/AuthContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      toast.success(`Welcome back, ${receivedUser.name}!`);
      return receivedUser;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      toast.success('Registration successful!');
      return receivedUser;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const isAdmin = user?.role === 'admin';
  const isHOD = user?.role === 'hod';
  const isFaculty = user?.role === 'faculty';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAdmin,
        isHOD,
        isFaculty
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

```

---

## 📄 File: `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If expired, clear and redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

```

---

## 📄 File: `frontend/src/components/Navbar.jsx`

```javascript
import React from 'react';
import { Menu, User, Sparkles, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Left Side: Mobile toggle + College Banner */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-college-50 border border-college-200 text-college-700">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-college-900 tracking-tight flex items-center gap-1.5">
                <span>Department of CSE</span>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-college-700 font-bold">Easwari Engineering College</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden md:block">
                Inter-Departmental Planning & Resource Sharing Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* In-app Notification Bell */}
          <NotificationDropdown />

          {/* User Profile Pill */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-college-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                {user?.name}
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-[9px] font-extrabold text-college-700 uppercase tracking-wider bg-college-50 px-1.5 py-0.5 rounded border border-college-200/60">
                  {user?.role}
                </span>
                {user?.department?.code && (
                  <span className="text-[10px] text-slate-500 font-semibold">
                    ({user?.department?.code})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

```

---

## 📄 File: `frontend/src/components/Sidebar.jsx`

```javascript
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  CalendarDays,
  FileCheck2,
  GraduationCap,
  FolderArchive,
  Bell,
  BarChart3,
  ShieldAlert,
  Users2,
  PlusCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isAdmin, isHOD, isFaculty } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Explore Resources', href: '/resources', icon: Building2, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Book a Resource', href: '/book-resource', icon: PlusCircle, roles: ['admin', 'hod', 'faculty'], highlight: true },
    { name: 'My Bookings', href: '/my-bookings', icon: CalendarCheck2, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Approvals', href: '/approvals', icon: FileCheck2, roles: ['admin', 'hod'] },
    { name: 'Master Calendar', href: '/calendar', icon: CalendarDays, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Exam Planning', href: '/exams', icon: GraduationCap, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Academic Hub', href: '/academic-hub', icon: FolderArchive, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['admin', 'hod', 'faculty'] },
    // Admin Only Links
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, roles: ['admin'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert, roles: ['admin'] },
    { name: 'Users & Depts', href: '/user-management', icon: Users2, roles: ['admin'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Brand logo & header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-college-500 to-college-700 flex items-center justify-center text-white font-bold shadow-md shadow-college-900/30 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              Easwari Engg College
            </h1>
            <p className="text-[11px] font-medium text-college-300 truncate">
              Dept of CSE • Resource Hub
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </div>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-college-600 text-white shadow-md shadow-college-700/30'
                      : item.highlight
                      ? 'text-college-300 hover:text-white hover:bg-slate-800/80 border border-college-500/20 bg-college-950/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="uppercase text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-college-600 text-white tracking-wide">
                  {user?.role}
                </span>
                {user?.department?.code && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {user?.department?.code}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

```

---

## 📄 File: `frontend/src/pages/Login.jsx`

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, LogIn, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // toast is shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-college-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-college-500 to-college-700 text-white shadow-xl shadow-college-900/50 mb-4 border border-college-400/30">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Easwari Engineering College
        </h2>
        <p className="mt-1 text-sm font-semibold text-college-300">
          Department of Computer Science and Engineering
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Inter-Departmental Planning & Resource Sharing Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Sign In</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter institutional credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@eec.srmrmp.edu.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-college-600 hover:bg-college-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-college-500 shadow-md shadow-college-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Demo Credentials (Evaluation)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@eec.srmrmp.edu.in')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition text-purple-900 group"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('hod.cse@eec.srmrmp.edu.in')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition text-blue-900 group"
              >
                <UserCheck className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">HOD CSE</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('faculty.cse1@eec.srmrmp.edu.in')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition text-emerald-900 group"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Faculty</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Password for all accounts is: <span className="font-mono font-semibold text-slate-600">Password@123</span>
            </p>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              New faculty member?{' '}
              <Link to="/register" className="font-bold text-college-600 hover:text-college-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

```

---

## 📄 File: `frontend/src/pages/Dashboard.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FolderArchive,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
  const { user, isAdmin, isHOD, isFaculty } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard-stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage text="Compiling departmental analytics..." />;
  }

  // FACULTY DASHBOARD VIEW
  if (isFaculty) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-college-900 via-college-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-college-950/20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-college-700/80 text-college-200 border border-college-500/30">
              Department of CSE | Faculty Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-college-200 mt-2 font-medium">
              Easily discover and book inter-departmental classrooms, laboratories, seminar halls, and view your exam invigilation duties.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/book-resource"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-college-900 font-bold rounded-xl text-xs hover:bg-college-50 transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-college-600" />
                <span>Book a Resource</span>
              </Link>
              <Link
                to="/academic-hub"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-700/60 hover:bg-college-700 text-white font-semibold rounded-xl text-xs border border-college-500/40 transition"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Upload Materials</span>
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
            <Building2 className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Faculty Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">My Total Bookings</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.myBookingsCount || 0}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-college-600 rounded-xl">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-medium">Across all campus departments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Approved Bookings</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.approvedBookingsCount || 0}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-3">Ready for lecture & labs</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Pending Requests</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingBookingsCount || 0}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-3">Awaiting HOD approval</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Invigilation Duties</p>
                <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{stats?.myDutiesCount || 0}</h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-purple-600 font-medium mt-3">Exam supervision slots</p>
          </div>
        </div>

        {/* Upcoming Bookings & Invigilation Duties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Bookings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <CalendarCheck2 className="w-4 h-4 text-college-600" />
                <span>My Upcoming Bookings</span>
              </h3>
              <Link to="/my-bookings" className="text-xs font-semibold text-college-600 hover:underline">
                View All
              </Link>
            </div>
            {stats?.upcomingBookings?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming bookings scheduled.</p>
            ) : (
              <div className="space-y-3">
                {stats?.upcomingBookings?.map((b) => (
                  <div key={b._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{b.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {b.resource?.name} • {b.date} ({b.startTime} - {b.endTime})
                      </p>
                    </div>
                    <Badge variant={b.status}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invigilation Duties */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>My Invigilation Duties</span>
              </h3>
              <Link to="/exams" className="text-xs font-semibold text-purple-600 hover:underline">
                View Timetable
              </Link>
            </div>
            {stats?.upcomingDuties?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No exam supervision assigned currently.</p>
            ) : (
              <div className="space-y-3">
                {stats?.upcomingDuties?.map((e) => (
                  <div key={e._id} className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{e.name}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        {e.subject} • {e.date} ({e.startTime} - {e.endTime})
                      </p>
                      <p className="text-[10px] text-purple-700 font-semibold mt-1">
                        Rooms: {e.rooms?.map(r => r.name).join(', ')}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-lg">
                      Assigned
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ADMIN & HOD DASHBOARD VIEW
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold text-college-700 bg-college-50 border border-college-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {isAdmin ? 'Campus Administrator Console' : `Head of Department Console (${user?.department?.code})`}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Inter-Departmental Operations & Planning
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of CSE | Easwari Engineering College Institutional Portal
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/approvals"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Manage Approvals</span>
            {stats?.pendingRequests > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {stats.pendingRequests}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link
              to="/reports"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Export CSV</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Resources</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalResources || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-college-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">Halls, Labs, Classes & Projectors</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Bookings Today</p>
              <h3 className="text-2xl font-extrabold text-college-700 mt-1">{stats?.bookingsToday || 0}</h3>
            </div>
            <div className="p-3 bg-college-50 text-college-700 rounded-xl">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-college-600 font-medium mt-3">Scheduled for current date</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending Requests</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingRequests || 0}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-3">Action required by HOD</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Approval Rate</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.approvalRate || 100}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-3">Positive request resolution</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings per Department (Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
            Bookings Distribution by Department
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.bookingsByDeptData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Total Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Type Utilization (Pie/Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
            Resource Inventory & Allocation by Type
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.utilizationByType || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="count" fill="#64748b" radius={[6, 6, 0, 0]} name="Inventory Count" />
                <Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} name="Active Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most-Used Resources & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Resources */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
            Most-Requested Academic Resources
          </h3>
          {stats?.topResources?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No utilization data recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.topResources?.map((r, idx) => (
                <div key={r.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-college-100 text-college-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{r.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium capitalize">
                        {r.type} • Dept of {r.department}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-college-700 bg-college-50 border border-college-200 px-2.5 py-1 rounded-lg">
                    {r.totalBookings} Bookings
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Recent Booking Activities
            </h3>
            <Link to="/calendar" className="text-xs font-bold text-college-600 hover:underline">
              Open Calendar
            </Link>
          </div>
          {stats?.recentBookings?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent bookings recorded.</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentBookings?.map((b) => (
                <div key={b._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{b.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {b.resource?.name} • By {b.requestedBy?.name} ({b.department?.code})
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {b.date} • {b.startTime} - {b.endTime}
                    </p>
                  </div>
                  <Badge variant={b.status}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

```

---

## 📄 File: `frontend/src/pages/Resources.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Users,
  MapPin,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Resources = () => {
  const { user, isAdmin, isHOD } = useAuth();
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [minCapacity, setMinCapacity] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'classroom',
    department: '',
    capacity: 60,
    location: '',
    description: '',
    features: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDept) params.department = selectedDept;
      if (selectedType) params.type = selectedType;
      if (minCapacity) params.minCapacity = minCapacity;

      const res = await api.get('/resources', { params });
      setResources(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedDept, selectedType, minCapacity]);

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      type: 'classroom',
      department: user.department?._id || (departments[0]?._id || ''),
      capacity: 60,
      location: '',
      description: '',
      features: 'Air Conditioned, Projector, Wi-Fi',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r) => {
    setEditingResource(r);
    setFormData({
      name: r.name,
      type: r.type,
      department: r.department?._id || r.department,
      capacity: r.capacity,
      location: r.location,
      description: r.description || '',
      features: (r.features || []).join(', '),
      isActive: r.isActive
    });
    setIsModalOpen(true);
  };

  const handleDeleteResource = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Resource deleted successfully.');
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resource.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingResource) {
        await api.put(`/resources/${editingResource._id}`, formData);
        toast.success('Resource updated successfully.');
      } else {
        await api.post('/resources', formData);
        toast.success('Resource created successfully.');
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const canManageResource = (r) => {
    if (isAdmin) return true;
    if (isHOD && user.department?._id === (r.department?._id || r.department)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Academic Resources
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover, inspect live schedules, and request bookings across all EEC departments.
          </p>
        </div>
        {(isAdmin || isHOD) && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, location, equipment..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                Dept of {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Resource Types</option>
            <option value="classroom">Classroom</option>
            <option value="lab">Computing & Hardware Lab</option>
            <option value="seminar hall">Seminar Hall & Auditorium</option>
            <option value="projector">Portable Projector</option>
            <option value="equipment">Specialized Equipment</option>
          </select>
        </div>

        {/* Min Capacity Filter */}
        <div>
          <input
            type="number"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            placeholder="Min Capacity (e.g. 50)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            min="0"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching resource catalogue..." />
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No resources found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or changing search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header row: Type badge + Department badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-college-50 text-college-800 border border-college-200/60">
                    {r.type}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Dept of {r.department?.code || 'N/A'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-college-700 transition-colors">
                  {r.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {r.description || 'No detailed description provided.'}
                </p>

                {/* Location and Capacity specs */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </div>
                  {r.capacity > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Seating Capacity: <strong className="text-slate-800">{r.capacity} seats</strong></span>
                    </div>
                  )}
                </div>

                {/* Amenities / Features tags */}
                {r.features && r.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.features.slice(0, 3).map((feat, idx) => (
                      <span key={idx} className="text-[10px] text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                        {feat}
                      </span>
                    ))}
                    {r.features.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{r.features.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/resources/${r._id}`}
                  className="text-xs font-bold text-college-700 hover:text-college-900 inline-flex items-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Check Availability</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/book-resource?resourceId=${r._id}`}
                    className="px-2.5 py-1.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                  >
                    Book Now
                  </Link>

                  {canManageResource(r) && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(r)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(r._id, r.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResource ? 'Edit Academic Resource' : 'Add New Academic Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Turing Seminar Hall / AI Computing Lab"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resource Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="seminar hall">Seminar Hall</option>
                <option value="projector">Projector</option>
                <option value="equipment">Specialized Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Owning Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={isHOD && !isAdmin}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white disabled:bg-slate-100"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Capacity (Seats)
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location / Block
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. CSE Block, 3rd Floor, Room 301"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Features & Amenities (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Air Conditioned, Dual Projectors, Surround Sound"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="State-of-the-art auditorium with 150 seating capacity and audio system..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-college-600 rounded focus:ring-college-500"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">
              Active for Booking & Scheduling
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-college-600 hover:bg-college-700 text-white rounded-xl text-xs font-bold shadow-md shadow-college-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingResource ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;

```

---

## 📄 File: `frontend/src/pages/BookResource.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarCheck2,
  Building2,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const BookResource = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedResource, setSelectedResource] = useState(searchParams.get('resourceId') || '');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');

  // Conflict Checking State
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState(null); // { available: bool, message: str }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources');
        setResources(res.data.data.filter(r => r.isActive));
        if (!selectedResource && res.data.data.length > 0) {
          setSelectedResource(res.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load resources.');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Run live availability check whenever resource, date, or time changes
  useEffect(() => {
    if (!selectedResource || !date || !startTime || !endTime) return;

    if (startTime >= endTime) {
      setConflictResult({
        available: false,
        message: 'Start time must be strictly earlier than end time.'
      });
      return;
    }

    const checkAvailability = async () => {
      try {
        setCheckingConflict(true);
        const res = await api.post(`/resources/${selectedResource}/check-availability`, {
          date,
          startTime,
          endTime
        });

        if (res.data.available) {
          setConflictResult({
            available: true,
            message: 'Slot is completely free and available for booking!'
          });
        } else {
          setConflictResult({
            available: false,
            message: res.data.conflictDetails?.message || 'Time conflict detected with an existing reservation.'
          });
        }
      } catch (err) {
        console.error('Availability check error:', err);
      } finally {
        setCheckingConflict(false);
      }
    };

    const timer = setTimeout(checkAvailability, 300);
    return () => clearTimeout(timer);
  }, [selectedResource, date, startTime, endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (startTime >= endTime) {
      toast.error('Start time must be before end time.');
      return;
    }

    if (conflictResult && !conflictResult.available) {
      toast.error(conflictResult.message);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        resource: selectedResource,
        title,
        purpose,
        date,
        startTime,
        endTime
      });

      toast.success('Booking request submitted! The owning department HOD has been notified.');
      navigate('/my-bookings');
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking submission failed.';
      toast.error(msg);
      if (err.response?.status === 409) {
        setConflictResult({
          available: false,
          message: msg
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentResourceObj = resources.find(r => r._id === selectedResource);

  if (loading) {
    return <LoadingSpinner fullPage text="Preparing sharing engine..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-college-700 uppercase tracking-wider bg-college-50 border border-college-200 px-2.5 py-1 rounded-full">
          Inter-Departmental Sharing Engine
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
          Request Academic Facility Reservation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select any department facility, check live schedule conflicts, and submit booking for automated HOD approval workflow.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Resource Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Campus Resource / Facility
            </label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white font-medium"
            >
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  [{r.department?.code || 'EEC'}] {r.name} ({r.type.toUpperCase()} • {r.capacity} Seats) - {r.location}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Resource Preview Card */}
          {currentResourceObj && (
            <div className="p-4 rounded-2xl bg-college-50/50 border border-college-100 flex items-start justify-between text-xs">
              <div>
                <p className="font-bold text-college-900">
                  {currentResourceObj.name}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Dept of {currentResourceObj.department?.code} • {currentResourceObj.location} • {currentResourceObj.capacity} Seats
                </p>
                {currentResourceObj.features && currentResourceObj.features.length > 0 && (
                  <p className="text-[11px] text-college-700 mt-1 font-medium">
                    Amenities: {currentResourceObj.features.join(', ')}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-college-200 text-college-900">
                {currentResourceObj.type}
              </span>
            </div>
          )}

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reservation Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time (24h)
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time (24h)
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>
          </div>

          {/* Conflict Detection Status Banner */}
          <div className="pt-1">
            {checkingConflict ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-4 h-4 rounded-full border-2 border-college-500 border-t-transparent animate-spin"></div>
                <span>Checking automated timetable conflict detection across campus...</span>
              </div>
            ) : conflictResult ? (
              conflictResult.available ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Available for Booking</p>
                    <p className="text-emerald-700 mt-0.5">{conflictResult.message}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Scheduling Conflict Detected!</p>
                    <p className="text-rose-700 mt-0.5">{conflictResult.message}</p>
                  </div>
                </div>
              )
            ) : null}
          </div>

          {/* Booking Title / Event Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event / Session Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. IEEE Distinguished Seminar on Quantum Machine Learning"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 font-medium"
            />
          </div>

          {/* Purpose / Justification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Academic Purpose & Details
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Explain expected student attendance, equipment requirements, speaker details..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          {/* Requester Info Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Requester: <strong className="text-slate-800">{user?.name}</strong></span>
            <span>Department: <strong className="text-slate-800">{user?.department?.code || 'N/A'}</strong></span>
            <span>Status: <strong className="text-amber-700">Pending Approval</strong></span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || (conflictResult && !conflictResult.available)}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-college-600 hover:bg-college-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-college-500 shadow-md shadow-college-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Submitting Booking Request...'
                  : conflictResult && !conflictResult.available
                  ? 'Resolve Conflict to Proceed'
                  : 'Submit Reservation Request'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookResource;

```

---

## 📄 File: `frontend/src/pages/Approvals.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  Calendar,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Approvals = () => {
  const { user, isAdmin, isHOD } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approval Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('approved'); // 'approved' or 'rejected'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/pending-approvals');
      setPendingRequests(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openActionModal = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setRemarks(type === 'approved' ? 'Request verified and approved. Please ensure orderly usage.' : 'Schedule conflict or unavailable for requested purpose.');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSubmitting(true);
    try {
      await api.put(`/bookings/${selectedBooking._id}/status`, {
        status: actionType,
        remarks
      });

      toast.success(`Booking successfully marked as ${actionType}. Requester has been notified.`);
      setSelectedBooking(null);
      fetchPending();
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${actionType} booking.`;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-college-700 uppercase tracking-wider bg-college-50 border border-college-200 px-2.5 py-1 rounded-full">
          Workflow Dispatch Center
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
          {isAdmin ? 'Campus-Wide Booking Approvals & Overrides' : `Department of ${user?.department?.code} Facility Approvals`}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming inter-departmental reservation requests, provide administrative remarks, and dispatch notifications.
        </p>
      </div>

      {/* Requests Table / Cards */}
      {loading ? (
        <LoadingSpinner text="Retrieving pending approval requests..." />
      ) : pendingRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no pending booking requests awaiting your approval at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingRequests.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Column: Details */}
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="pending">Pending Review</Badge>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    Facility: {b.resource?.name}
                  </span>
                  <span className="text-[11px] font-semibold text-college-700 bg-college-50 px-2 py-0.5 rounded">
                    Dept of {b.resource?.department?.code || user?.department?.code}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">
                  {b.title}
                </h3>

                {b.purpose && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-700">Purpose:</strong> {b.purpose}
                  </p>
                )}

                {/* Requester & Time Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-college-600" />
                    <span>
                      <strong className="text-slate-800">{b.requestedBy?.name}</strong> ({b.requestedBy?.designation || 'Faculty'} - Dept of {b.department?.code || b.requestedBy?.department?.code})
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-college-600" />
                    <span>
                      {b.date} • <strong className="text-slate-800">{b.startTime} - {b.endTime}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center space-x-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button
                  onClick={() => openActionModal(b, 'approved')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Request</span>
                </button>

                <button
                  onClick={() => openActionModal(b, 'rejected')}
                  className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Remarks Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={actionType === 'approved' ? 'Confirm Booking Approval' : 'Reject Booking Request'}
      >
        {selectedBooking && (
          <form onSubmit={handleDecisionSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p><strong className="text-slate-700">Facility:</strong> {selectedBooking.resource?.name}</p>
              <p><strong className="text-slate-700">Date & Slot:</strong> {selectedBooking.date} ({selectedBooking.startTime} - {selectedBooking.endTime})</p>
              <p><strong className="text-slate-700">Requester:</strong> {selectedBooking.requestedBy?.name}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Remarks / Instructions for Requester
              </label>
              <textarea
                rows={3}
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add special instructions, lab key access details, or reason for rejection..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
                  actionType === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                }`}
              >
                {submitting ? 'Processing...' : actionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Approvals;

```

---

## 📄 File: `frontend/src/pages/Exams.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Search,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Exams = () => {
  const { user, isAdmin, isHOD } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my-duties'
  const [exams, setExams] = useState([]);
  const [myDuties, setMyDuties] = useState([]);
  const [resources, setResources] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Exam Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Continuous Internal Assessment I (CIA-I)',
    subject: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:30',
    endTime: '12:30',
    rooms: [],
    invigilators: [],
    seatsPerRoom: 30,
    totalStudents: 60
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const [examRes, dutiesRes, resRes, facRes, deptRes] = await Promise.all([
        api.get('/exams'),
        api.get('/exams/my-duties'),
        api.get('/resources'),
        api.get('/users?role=faculty'),
        api.get('/departments')
      ]);
      setExams(examRes.data.data);
      setMyDuties(dutiesRes.data.data);
      setResources(resRes.data.data);
      setFacultyList(facRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load examination timetable data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      name: 'Continuous Internal Assessment I (CIA-I)',
      subject: '',
      department: user.department?._id || (departments[0]?._id || ''),
      date: new Date().toISOString().split('T')[0],
      startTime: '09:30',
      endTime: '12:30',
      rooms: [],
      invigilators: [],
      seatsPerRoom: 30,
      totalStudents: 60
    });
    setIsModalOpen(true);
  };

  const handleRoomToggle = (roomId) => {
    const currentRooms = [...formData.rooms];
    const index = currentRooms.indexOf(roomId);
    if (index > -1) {
      currentRooms.splice(index, 1);
    } else {
      currentRooms.push(roomId);
    }
    setFormData({ ...formData, rooms: currentRooms });
  };

  const handleInvigilatorToggle = (invigId) => {
    const currentInvigs = [...formData.invigilators];
    const index = currentInvigs.indexOf(invigId);
    if (index > -1) {
      currentInvigs.splice(index, 1);
    } else {
      currentInvigs.push(invigId);
    }
    setFormData({ ...formData, invigilators: currentInvigs });
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();

    if (formData.rooms.length === 0) {
      toast.error('Please assign at least one examination room.');
      return;
    }

    if (formData.invigilators.length === 0) {
      toast.error('Please assign at least one faculty invigilator.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/exams', formData);
      toast.success('Exam scheduled successfully! Assigned invigilators have been notified.');
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule exam.';
      toast.error(msg, { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete exam "${name}"?`)) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam schedule deleted.');
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete exam.');
    }
  };

  // Seat allocation summary helper
  const totalCapacitySelected = formData.rooms.reduce((acc, roomId) => {
    const res = resources.find(r => r._id === roomId);
    return acc + (res?.capacity || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header & Create Exam */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-college-700 uppercase tracking-wider bg-college-50 border border-college-200 px-2.5 py-1 rounded-full">
            Examination Planning & Seating Allocation
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Exam Timetable & Invigilation Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate exam hall allocations with automated conflict detection and invigilator double-booking prevention.
          </p>
        </div>

        {(isAdmin || isHOD) && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Exam</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'all'
              ? 'border-college-600 text-college-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>All Scheduled Exams ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my-duties')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'my-duties'
              ? 'border-college-600 text-college-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>My Invigilation Duties ({myDuties.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading examination data..." />
      ) : activeTab === 'my-duties' ? (
        // MY DUTIES VIEW
        myDuties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Invigilation Duties Assigned</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are currently not assigned as an invigilator for any upcoming examinations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myDuties.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-2xl border border-purple-200/80 shadow-xs p-6 space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    Invigilation Duty
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Dept of {exam.department?.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{exam.name}</h3>
                  <p className="text-xs font-semibold text-college-700 mt-0.5">{exam.subject}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span><strong>Date:</strong> {exam.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span><strong>Exam Hours:</strong> {exam.startTime} - {exam.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span><strong>Allotted Rooms:</strong> {exam.rooms?.map(r => r.name).join(', ')}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Reporting Time: <strong>30 mins prior</strong></span>
                  <span className="text-emerald-600 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // ALL EXAMS VIEW
        exams.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Exams Scheduled</h3>
            <p className="text-xs text-slate-500 mt-1">Click "Schedule New Exam" to create an exam timetable.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-college-50 text-college-800 border border-college-200">
                      Dept of {exam.department?.code}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {exam.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600">{exam.subject}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800 flex items-center justify-end space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-college-600" />
                        <span>{exam.date}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {exam.startTime} - {exam.endTime}
                      </p>
                    </div>
                    {(isAdmin || (isHOD && user.department?._id === (exam.department?._id || exam.department))) && (
                      <button
                        onClick={() => handleDeleteExam(exam._id, exam.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rooms and Invigilators Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Assigned Rooms & Seats */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-college-600" />
                      <span>Exam Rooms & Seating Capacity</span>
                    </h4>
                    <div className="space-y-1">
                      {exam.rooms?.map((r) => (
                        <div key={r._id} className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>{r.name} ({r.location})</span>
                          <span className="font-bold text-slate-800">{r.capacity} seats</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-college-800">
                      <span>Total Students: {exam.totalStudents}</span>
                      <span>Target Seats/Room: {exam.seatsPerRoom}</span>
                    </div>
                  </div>

                  {/* Assigned Invigilators */}
                  <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 space-y-2">
                    <h4 className="font-bold text-purple-900 flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Assigned Faculty Invigilators</span>
                    </h4>
                    <div className="space-y-1">
                      {exam.invigilators?.map((invig) => (
                        <div key={invig._id} className="flex items-center justify-between text-[11px] text-slate-700">
                          <span>{invig.name} ({invig.department?.code || 'Faculty'})</span>
                          <span className="text-[10px] text-purple-700 font-semibold">{invig.designation}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-purple-600 italic pt-1">
                      Automated conflict detection prevents double-booking across departments.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Create Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Exam Timetable with Conflict Protection"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitExam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exam Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Continuous Internal Assessment I"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject Code & Title
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="CS8591 - Computer Networks"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exam Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>
          </div>

          {/* Seating Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Students</label>
              <input
                type="number"
                min="1"
                value={formData.totalStudents}
                onChange={(e) => setFormData({ ...formData, totalStudents: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Seats Allowed Per Room</label>
              <input
                type="number"
                min="1"
                value={formData.seatsPerRoom}
                onChange={(e) => setFormData({ ...formData, seatsPerRoom: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Multi-Room Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Examination Rooms ({formData.rooms.length} selected • Total Capacity: {totalCapacitySelected})
              </label>
              <span className="text-[10px] text-slate-400">Classrooms and Lecture Halls</span>
            </div>
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/50">
              {resources
                .filter(r => ['classroom', 'seminar hall', 'lab'].includes(r.type))
                .map((r) => {
                  const isSelected = formData.rooms.includes(r._id);
                  return (
                    <div
                      key={r._id}
                      onClick={() => handleRoomToggle(r._id)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-college-600 text-white border-college-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-college-300'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <p className="font-bold truncate">{r.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-college-100' : 'text-slate-400'}`}>
                          Dept of {r.department?.code} • {r.capacity} seats
                        </p>
                      </div>
                      <span className="text-xs">{isSelected ? '✓' : '+'}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Invigilator Assignment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assign Faculty Invigilators ({formData.invigilators.length} selected)
              </label>
              <span className="text-[10px] text-slate-400">Automatic double-booking check enforced</span>
            </div>
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/50">
              {facultyList.map((fac) => {
                const isSelected = formData.invigilators.includes(fac._id);
                return (
                  <div
                    key={fac._id}
                    onClick={() => handleInvigilatorToggle(fac._id)}
                    className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <p className="font-bold truncate">{fac.name}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                        Dept of {fac.department?.code || 'EEC'}
                      </p>
                    </div>
                    <span className="text-xs">{isSelected ? '✓' : '+'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-college-600 hover:bg-college-700 text-white rounded-xl text-xs font-bold shadow-md shadow-college-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Validating Conflicts & Scheduling...' : 'Confirm & Schedule Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Exams;

```

---

## 📄 File: `frontend/src/pages/AcademicHub.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  FileCode,
  FileSpreadsheet,
  File,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AcademicHub = () => {
  const { user, isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    department: '',
    type: 'notes',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDept) params.department = selectedDept;
      if (selectedType) params.type = selectedType;

      const [matRes, deptRes] = await Promise.all([
        api.get('/materials', { params }),
        api.get('/departments')
      ]);
      setMaterials(matRes.data.data);
      setDepartments(deptRes.data.data);
      if (!uploadData.department && deptRes.data.data.length > 0) {
        setUploadData(prev => ({ ...prev, department: user.department?._id || deptRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load academic materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm, selectedDept, selectedType]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds the 10MB limit.');
        return;
      }
      setUploadData({ ...uploadData, file: selected });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    formData.append('department', uploadData.department || user.department?._id);
    formData.append('type', uploadData.type);
    formData.append('file', uploadData.file);

    try {
      await api.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Academic material uploaded successfully!');
      setIsModalOpen(false);
      setUploadData({
        title: '',
        subject: '',
        department: user.department?._id || '',
        type: 'notes',
        file: null
      });
      fetchMaterials();
    } catch (err) {
      const msg = err.response?.data?.message || 'File upload failed.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (id, fileName) => {
    // Open download endpoint
    const token = localStorage.getItem('token');
    window.open(`/api/materials/${id}/download?token=${token}`, '_blank');
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Material deleted.');
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete material.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-college-700 uppercase tracking-wider bg-college-50 border border-college-200 px-2.5 py-1 rounded-full">
            Knowledge Sharing Hub
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Inter-Departmental Academic Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access and contribute lecture notes, laboratory manuals, question banks, research datasets, and papers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Academic Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, subject, filename..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                Dept of {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Material Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Material Types</option>
            <option value="notes">Lecture Notes</option>
            <option value="lab manual">Lab Manual</option>
            <option value="question bank">Question Bank</option>
            <option value="dataset">Dataset / Project Code</option>
            <option value="research">Research Publication</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <LoadingSpinner text="Retrieving repository index..." />
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Materials Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting search filters or upload a new resource.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((m) => {
            const isOwner = user?._id === (m.uploadedBy?._id || m.uploadedBy) || isAdmin;

            return (
              <div
                key={m._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-college-50 text-college-800 border border-college-200">
                      {m.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Dept of {m.department?.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2">
                    {m.title}
                  </h3>

                  <p className="text-xs font-semibold text-college-700">
                    {m.subject}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p className="truncate">File: <strong className="text-slate-700">{m.originalName}</strong></p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatFileSize(m.fileSize)}</span>
                      <span>{m.downloads} downloads</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Uploaded by <strong className="text-slate-600">{m.uploadedBy?.name || 'Faculty'}</strong> on {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDownload(m._id, m.originalName)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-college-600 hover:bg-college-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(m._id, m.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Academic Hub Material (Up to 10MB)"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Material Title
            </label>
            <input
              type="text"
              required
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              placeholder="e.g. CS8591 Computer Networks Units 1-5 Lecture Slides"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject Code & Name
              </label>
              <input
                type="text"
                required
                value={uploadData.subject}
                onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                placeholder="CS8591 - Computer Networks"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Material Type
              </label>
              <select
                value={uploadData.type}
                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
              >
                <option value="notes">Lecture Notes</option>
                <option value="lab manual">Lab Manual</option>
                <option value="question bank">Question Bank</option>
                <option value="dataset">Dataset / Code</option>
                <option value="research">Research Publication</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={uploadData.department}
              onChange={(e) => setUploadData({ ...uploadData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  Dept of {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Document File (PDF, DOCX, PPTX, ZIP, CSV - Max 10MB)
            </label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-college-50 file:text-college-700 hover:file:bg-college-100 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-college-600 hover:bg-college-700 text-white rounded-xl text-xs font-bold shadow-md shadow-college-600/30 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading to Hub...' : 'Upload File'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicHub;

```

---

## 📄 File: `frontend/src/pages/Reports.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  CalendarCheck2,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [statsRes, bookRes] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/bookings')
        ]);
        setStats(statsRes.data.stats);
        setBookings(bookRes.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load reporting data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExportBookings = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/reports/export-bookings?token=${token}`, '_blank');
  };

  const handleExportUtilization = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/reports/export-utilization?token=${token}`, '_blank');
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Compiling institutional analytics report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-college-700 uppercase tracking-wider bg-college-50 border border-college-200 px-2.5 py-1 rounded-full">
            Executive Analytics & Reports
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-college-600" />
            <span>Resource Utilization & Booking History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of CSE | Easwari Engineering College Academic Scheduling Metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBookings}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Bookings CSV</span>
          </button>

          <button
            onClick={handleExportUtilization}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Utilization CSV</span>
          </button>
        </div>
      </div>

      {/* Utilization Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Campus Inventory</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalResources} Facilities</h3>
          <p className="text-[11px] text-slate-400 mt-2">Classrooms, Labs & Halls</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Lifetime Bookings</p>
          <h3 className="text-2xl font-extrabold text-college-700 mt-1">{bookings.length} Requests</h3>
          <p className="text-[11px] text-college-600 mt-2 font-medium">Recorded in registry</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Confirmed Utilization</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.approvedRequests} Approved</h3>
          <p className="text-[11px] text-emerald-600 mt-2 font-medium">Successfully conducted</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Approval Efficiency</p>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{stats?.approvalRate}%</h3>
          <p className="text-[11px] text-indigo-600 mt-2 font-medium">Inter-departmental approval rate</p>
        </div>
      </div>

      {/* Utilization breakdown by resource type */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
          Resource Category Utilization Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {stats?.utilizationByType?.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-xs font-bold text-slate-800">{item.type}</span>
              <p className="text-xl font-extrabold text-college-800">{item.bookings} Bookings</p>
              <p className="text-[10px] text-slate-500">{item.count} items in inventory</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Booking History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Master Booking Audit Log ({bookings.length} Records)
          </h3>
          <span className="text-xs text-slate-400">Available for CSV Export</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-3">Title / Purpose</th>
                <th className="py-3 px-3">Facility</th>
                <th className="py-3 px-3">Dept</th>
                <th className="py-3 px-3">Requester</th>
                <th className="py-3 px-3">Date & Slot</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-bold text-slate-800 max-w-xs truncate">
                    {b.title}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {b.resource?.name}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-500">
                    {b.department?.code || 'EEC'}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {b.requestedBy?.name}
                  </td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {b.date} ({b.startTime}-{b.endTime})
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={b.status}>{b.status}</Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {b.approvedBy?.name || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

```
