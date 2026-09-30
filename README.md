# Inter-Departmental Planning & Resource Sharing Platform
### Department of Computer Science & Engineering | Easwari Engineering College

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18.x-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v5.x-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-v4.19-000000?logo=express)](https://expressjs.com)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com)

---

## 📌 Project Overview
The **Inter-Departmental Planning & Resource Sharing Platform** is a centralized, role-based MERN web application developed for **Department of CSE, Easwari Engineering College**. It replaces fragmented Excel sheets, paper registers, disconnected emails, and phone calls with an automated system featuring:
- **Sharing Engine**: Cross-department resource discovery and live slot availability checking.
- **Smart Scheduler**: Instant, real-time conflict detection preventing double-booking of physical facilities and examination invigilators.
- **Structured Approval Workflows**: Role-governed request submission and HOD review with audit remarks and real-time in-app notifications.
- **Examination Timetable & Seating Planning**: Multi-room allotment, capacity checking, and double-booking protection for invigilators.
- **Academic Material Repository**: Central hub for sharing lecture notes, lab manuals, question banks, datasets, and research papers (up to 10MB).
- **Executive Analytics & Reporting**: Real-time KPI dashboards, Recharts department utilization charts, and one-click CSV report exports.

---

## 🏗️ System Architecture & Folder Structure

```
resource_sharing_platform/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection + in-memory fallback
│   │   └── seedData.js        # Shared database seeding logic
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── departmentController.js
│   │   ├── userController.js
│   │   ├── resourceController.js
│   │   ├── bookingController.js
│   │   ├── examController.js
│   │   ├── materialController.js
│   │   ├── notificationController.js
│   │   ├── auditLogController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & role authorization (Admin/HOD/Faculty)
│   │   ├── upload.js          # Multer 10MB document upload handler
│   │   └── errorHandler.js    # Centralized REST error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Resource.js
│   │   ├── Booking.js
│   │   ├── Exam.js
│   │   ├── Material.js
│   │   ├── Notification.js
│   │   └── AuditLog.js
│   ├── routes/                # Express API routes
│   ├── uploads/               # Academic hub uploaded documents storage
│   ├── utils/
│   │   ├── auditLogger.js     # Immutable action logging utility
│   │   └── conflictChecker.js # Schedule and invigilator overlap algorithm
│   ├── .env                   # Environment variables (excluded by .gitignore)
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── seed.js                # Standalone database population script
│   └── server.js              # Express application entry point
├── frontend/
│   ├── public/
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
│   │   │   └── AuthContext.jsx # Authentication state & profile manager
│   │   ├── pages/
│   │   │   ├── Login.jsx       # With 1-click Demo credentials
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx   # Role-adaptive analytics & Recharts graphs
│   │   │   ├── Resources.jsx   # Resource catalogue with search & filters
│   │   │   ├── ResourceDetail.jsx # Live daily timetable visualizer
│   │   │   ├── BookResource.jsx   # Sharing engine with instant conflict check
│   │   │   ├── MyBookings.jsx  # Status tracking and cancellation
│   │   │   ├── Approvals.jsx   # HOD/Admin review with remarks modal
│   │   │   ├── CalendarView.jsx# Master interactive monthly schedule
│   │   │   ├── Exams.jsx       # Exam timetables, seating & invigilation
│   │   │   ├── AcademicHub.jsx # Upload/Download academic files (up to 10MB)
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── Reports.jsx     # Admin utilization stats & CSV exports
│   │   │   ├── AuditLogs.jsx   # Admin audit trail
│   │   │   └── UserManagement.jsx # Admin faculty & dept directory
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptors
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/                      # Screenshots & submission documents
├── .gitignore
├── package.json               # Root package orchestrator (concurrent dev)
└── README.md
```

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
- **Node.js** (v18.x or v20.x or v24.x)
- **npm** (v9.x or later)

### 2. Environment Configuration
The backend uses environment variables configured in `backend/.env`.
A template is provided in `backend/.env.example`:

```bash
# backend/.env
MONGO_URI=PASTE_YOUR_ATLAS_CONNECTION_STRING_HERE
JWT_SECRET=change_this_secret
PORT=5000
```
> **Note**: If `MONGO_URI` is left with the placeholder or MongoDB Atlas is not yet set up, the platform automatically boots an embedded local MongoDB instance out-of-the-box so you can demonstrate the entire app immediately without any configuration!

### 3. Install All Dependencies
From the project root:
```bash
npm run install:all
```
*(Or install individually: `npm install`, `cd backend && npm install`, `cd frontend && npm install`)*

### 4. Seed Sample College Dataset
Clear and populate 4 departments, 17 users, 16 academic resources, 10 bookings, 2 exams, 5 academic files, and audit logs:
```bash
npm run seed
```

### 5. Launch the Platform
Start both the Express backend API and Vite React frontend concurrently:
```bash
npm run dev
```
- **Frontend URL**: [http://localhost:3000](http://localhost:3000)
- **Backend API URL**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Login Credentials
All pre-seeded demo accounts share the password: **`Password@123`**
*(The Login page also includes **One-Click Quick Fill** buttons for immediate testing!)*

| Role | Name | Department | Email | Password |
|---|---|---|---|---|
| **Administrator** | Dr. S. K. Ramesh | Academic Dean | `admin@eec.srmrmp.edu.in` | `Password@123` |
| **HOD (CSE)** | Dr. G. S. Anandha Mala | CSE | `hod.cse@eec.srmrmp.edu.in` | `Password@123` |
| **HOD (ECE)** | Dr. M. Sangeetha | ECE | `hod.ece@eec.srmrmp.edu.in` | `Password@123` |
| **HOD (MECH)** | Dr. V. Antony Aroul Raj | MECH | `hod.mech@eec.srmrmp.edu.in` | `Password@123` |
| **HOD (IT)** | Dr. N. Ananthi | IT | `hod.it@eec.srmrmp.edu.in` | `Password@123` |
| **Faculty (CSE)** | Prof. K. Sundar | CSE | `faculty.cse1@eec.srmrmp.edu.in` | `Password@123` |
| **Faculty (ECE)** | Prof. B. Suresh | ECE | `faculty.ece1@eec.srmrmp.edu.in` | `Password@123` |
| **Faculty (MECH)** | Prof. A. Murugan | MECH | `faculty.mech1@eec.srmrmp.edu.in` | `Password@123` |
| **Faculty (IT)** | Prof. V. Anitha | IT | `faculty.it1@eec.srmrmp.edu.in` | `Password@123` |

---

## 📡 REST API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new faculty account
- `POST /api/auth/login` — Sign in and obtain JWT bearer token
- `GET /api/auth/me` — Retrieve authenticated user profile *(Protected)*
- `PUT /api/auth/profile` — Update account profile details *(Protected)*

### Departments (`/api/departments`)
- `GET /api/departments` — List all departments
- `POST /api/departments` — Create new department *(Admin)*
- `PUT /api/departments/:id` — Update department *(Admin)*
- `DELETE /api/departments/:id` — Delete department *(Admin)*

### Resources & Sharing Engine (`/api/resources`)
- `GET /api/resources` — Filter resources by type, department, capacity, or search query
- `GET /api/resources/:id` — Resource details and date-filtered schedule
- `POST /api/resources/:id/check-availability` — Real-time time conflict detection
- `POST /api/resources` — Create new facility *(Admin / HOD)*
- `PUT /api/resources/:id` — Update facility *(Admin / HOD)*
- `DELETE /api/resources/:id` — Remove facility *(Admin / HOD)*

### Bookings & Approvals (`/api/bookings`)
- `POST /api/bookings` — Submit reservation request *(Conflict check enforced)*
- `GET /api/bookings` — Query bookings by status, department, date, or user
- `GET /api/bookings/pending-approvals` — Pending requests for HOD/Admin
- `PUT /api/bookings/:id/status` — Approve/Reject request with remarks *(HOD / Admin)*
- `PUT /api/bookings/:id/cancel` — Cancel booking request *(Requester / Admin)*

### Examinations (`/api/exams`)
- `POST /api/exams` — Schedule exam *(Multi-room & invigilator conflict validation)*
- `GET /api/exams` — List all scheduled examination timetables
- `GET /api/exams/my-duties` — Invigilation duty assignments for logged-in faculty
- `DELETE /api/exams/:id` — Delete exam timetable *(HOD / Admin)*

### Academic Hub (`/api/materials`)
- `POST /api/materials` — Upload document (PDF, DOCX, PPTX, ZIP, up to 10MB)
- `GET /api/materials` — Search and filter repository files
- `GET /api/materials/:id/download` — Stream document and increment download count
- `DELETE /api/materials/:id` — Delete own uploaded file *(Owner / Admin)*

### Notifications & Auditing (`/api/notifications`, `/api/audit-logs`, `/api/reports`)
- `GET /api/notifications` — In-app alerts with unread counter
- `PUT /api/notifications/:id/read` — Mark alert as read
- `PUT /api/notifications/read-all` — Mark all alerts as read
- `GET /api/audit-logs` — Administrative governance trail *(Admin)*
- `GET /api/reports/dashboard-stats` — Departmental KPI aggregations & chart metrics
- `GET /api/reports/export-bookings` — Download complete bookings report as CSV *(Admin)*
- `GET /api/reports/export-utilization` — Download resource utilization metrics as CSV *(Admin)*

---

## 🏛️ Institution
**Department of Computer Science and Engineering**  
**Easwari Engineering College (Autonomous)**  
Bharathi Salai, Ramapuram, Chennai, Tamil Nadu 600089
