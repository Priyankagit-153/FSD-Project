const Department = require('../models/Department');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const Exam = require('../models/Exam');
const Material = require('../models/Material');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const path = require('path');
const fs = require('fs');

const runSeed = async () => {
  const count = await Department.countDocuments();
  if (count > 0) {
    console.log(`[Seed] Database already contains ${count} departments. Skipping auto-seed.`);
    return;
  }

  console.log('[Seed] Auto-initializing database with college default seed data...');

  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const sampleFiles = [
    { name: 'sample_cn_notes.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (CS8591 Computer Networks Unit 1-5 Lecture Notes) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
    { name: 'sample_dbms_lab_manual.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (CS8481 Database Management Systems Laboratory Manual) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
    { name: 'sample_ece_signals_qb.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (EC8352 Signals and Systems Anna University Question Bank) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
    { name: 'sample_ai_dataset.csv', content: 'student_id,attendance_rate,internal_marks,cgpa,placed\n101,92,88,8.7,Yes\n102,78,65,7.1,Yes\n103,85,74,7.8,Yes\n104,95,94,9.2,Yes' },
    { name: 'sample_iot_research_paper.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (Smart Campus Energy Monitoring with IoT & LoRaWAN) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' }
  ];

  for (const sf of sampleFiles) {
    const filePath = path.join(uploadsDir, sf.name);
    fs.writeFileSync(filePath, sf.content);
  }

  const depts = await Department.create([
    {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering, Easwari Engineering College'
    },
    {
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      description: 'Department of Electronics and Communication Engineering'
    },
    {
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Department of Mechanical Engineering'
    },
    {
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology'
    }
  ]);

  const cseDept = depts.find(d => d.code === 'CSE');
  const eceDept = depts.find(d => d.code === 'ECE');
  const mechDept = depts.find(d => d.code === 'MECH');
  const itDept = depts.find(d => d.code === 'IT');

  const defaultPassword = 'Password@123';

  const admin = await User.create({
    name: 'Dr. S. K. Ramesh (Admin)',
    email: 'admin@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'admin',
    designation: 'Vice Principal & Academic Dean',
    phone: '+91 94441 23450'
  });

  const hodCSE = await User.create({
    name: 'Dr. G. S. Anandha Mala (HOD CSE)',
    email: 'hod.cse@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'hod',
    department: cseDept._id,
    designation: 'Professor & Head of Department',
    phone: '+91 94441 23451'
  });

  const hodECE = await User.create({
    name: 'Dr. M. Sangeetha (HOD ECE)',
    email: 'hod.ece@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'hod',
    department: eceDept._id,
    designation: 'Professor & Head of Department',
    phone: '+91 94441 23452'
  });

  const hodMECH = await User.create({
    name: 'Dr. V. Antony Aroul Raj (HOD MECH)',
    email: 'hod.mech@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'hod',
    department: mechDept._id,
    designation: 'Professor & Head of Department',
    phone: '+91 94441 23453'
  });

  const hodIT = await User.create({
    name: 'Dr. N. Ananthi (HOD IT)',
    email: 'hod.it@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'hod',
    department: itDept._id,
    designation: 'Professor & Head of Department',
    phone: '+91 94441 23454'
  });

  const facCSE1 = await User.create({
    name: 'Prof. K. Sundar (CSE)',
    email: 'faculty.cse1@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: cseDept._id,
    designation: 'Associate Professor',
    phone: '+91 98401 11001'
  });
  const facCSE2 = await User.create({
    name: 'Prof. R. Priya (CSE)',
    email: 'faculty.cse2@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: cseDept._id,
    designation: 'Assistant Professor (Sr. Gr)',
    phone: '+91 98401 11002'
  });
  const facCSE3 = await User.create({
    name: 'Prof. M. Karthik (CSE)',
    email: 'faculty.cse3@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: cseDept._id,
    designation: 'Assistant Professor',
    phone: '+91 98401 11003'
  });

  const facECE1 = await User.create({
    name: 'Prof. B. Suresh (ECE)',
    email: 'faculty.ece1@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: eceDept._id,
    designation: 'Associate Professor',
    phone: '+91 98401 22001'
  });
  const facECE2 = await User.create({
    name: 'Prof. D. Divya (ECE)',
    email: 'faculty.ece2@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: eceDept._id,
    designation: 'Assistant Professor',
    phone: '+91 98401 22002'
  });
  const facECE3 = await User.create({
    name: 'Prof. S. Rajesh (ECE)',
    email: 'faculty.ece3@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: eceDept._id,
    designation: 'Assistant Professor',
    phone: '+91 98401 22003'
  });

  const facMECH1 = await User.create({
    name: 'Prof. A. Murugan (MECH)',
    email: 'faculty.mech1@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: mechDept._id,
    designation: 'Associate Professor',
    phone: '+91 98401 33001'
  });
  const facMECH2 = await User.create({
    name: 'Prof. T. Venkatesh (MECH)',
    email: 'faculty.mech2@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: mechDept._id,
    designation: 'Assistant Professor',
    phone: '+91 98401 33002'
  });
  const facMECH3 = await User.create({
    name: 'Prof. P. Lakshmi (MECH)',
    email: 'faculty.mech3@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: mechDept._id,
    designation: 'Assistant Professor',
    phone: '+91 98401 33003'
  });

  const facIT1 = await User.create({
    name: 'Prof. V. Anitha (IT)',
    email: 'faculty.it1@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: itDept._id,
    designation: 'Associate Professor',
    phone: '+91 98401 44001'
  });
  const facIT2 = await User.create({
    name: 'Prof. G. Praveen (IT)',
    email: 'faculty.it2@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: itDept._id,
    designation: 'Assistant Professor',
    phone: '+91 98401 44002'
  });
  const facIT3 = await User.create({
    name: 'Prof. C. Meena (IT)',
    email: 'faculty.it3@eec.srmrmp.edu.in',
    password: defaultPassword,
    role: 'faculty',
    department: itDept._id,
    designation: 'Assistant Professor',
    phone: '+91 98401 44003'
  });

  const resources = await Resource.create([
    {
      name: 'CSE Turing Seminar Hall',
      type: 'seminar hall',
      department: cseDept._id,
      capacity: 150,
      location: 'CSE Block, 3rd Floor, Room 301',
      description: 'Acoustically treated seminar hall with dual projectors.',
      features: ['Air Conditioned', 'Dual Projectors', 'Surround Sound', 'Podium Mic'],
      isActive: true
    },
    {
      name: 'AI & Deep Learning Computing Lab',
      type: 'lab',
      department: cseDept._id,
      capacity: 65,
      location: 'CSE Block, 2nd Floor, Lab 3',
      description: 'High-performance GPU cluster workstation lab.',
      features: ['NVIDIA GPUs', 'Air Conditioned', 'Gigabit LAN', 'Smart Screen'],
      isActive: true
    },
    {
      name: 'CSE Smart Classroom 204',
      type: 'classroom',
      department: cseDept._id,
      capacity: 70,
      location: 'CSE Block, 2nd Floor, Room 204',
      description: 'Interactive smart board classroom with tiered seating.',
      features: ['Interactive Smart Board', 'Lecture Capture', 'Air Conditioned'],
      isActive: true
    },
    {
      name: 'Epson 4K Laser Projector Unit 1',
      type: 'projector',
      department: cseDept._id,
      capacity: 1,
      location: 'CSE Department Equipment Room',
      description: 'Portable ultra-bright 4500 Lumens HDMI laser projector.',
      features: ['4K Support', 'Wireless HDMI', 'Portable Kit'],
      isActive: true
    },
    {
      name: 'ECE Marconi Auditorium',
      type: 'seminar hall',
      department: eceDept._id,
      capacity: 200,
      location: 'Main Block, Ground Floor',
      description: 'Large departmental auditorium for conferences and symposiums.',
      features: ['Air Conditioned', 'JBL Sound System', 'Motorized Screen'],
      isActive: true
    },
    {
      name: 'VLSI & Embedded Systems Design Lab',
      type: 'lab',
      department: eceDept._id,
      capacity: 50,
      location: 'ECE Block, 1st Floor, Lab 2',
      description: 'Cadence and Xilinx FPGA hardware design lab.',
      features: ['FPGA Test Benches', 'Digital Oscilloscopes', 'Air Conditioned'],
      isActive: true
    },
    {
      name: 'ECE Lecture Hall 102',
      type: 'classroom',
      department: eceDept._id,
      capacity: 65,
      location: 'ECE Block, 1st Floor, Room 102',
      description: 'Modern lecture room equipped with ceiling speaker array.',
      features: ['Projector', 'Audio System', 'Whiteboard'],
      isActive: true
    },
    {
      name: 'Keysight Digital Storage Oscilloscope Rig',
      type: 'equipment',
      department: eceDept._id,
      capacity: 1,
      location: 'ECE RF Lab, Shelf B4',
      description: 'High frequency 1GHz digital storage oscilloscope.',
      features: ['1GHz Bandwidth', 'Logic Analyzer'],
      isActive: true
    },
    {
      name: 'CAD/CAM Simulation & Modeling Lab',
      type: 'lab',
      department: mechDept._id,
      capacity: 55,
      location: 'Mechanical Block, Ground Floor',
      description: 'SolidWorks, ANSYS, and CATIA design modeling lab.',
      features: ['SolidWorks / ANSYS', 'Air Conditioned', 'Workstations'],
      isActive: true
    },
    {
      name: 'Thermal & Fluid Dynamics Research Lab',
      type: 'lab',
      department: mechDept._id,
      capacity: 40,
      location: 'Mechanical Block, Annex C',
      description: 'Specialized testing lab with wind tunnel and IC engine test rigs.',
      features: ['Wind Tunnel', 'IC Engine Test Rig'],
      isActive: true
    },
    {
      name: 'MECH Conference Hall 101',
      type: 'seminar hall',
      department: mechDept._id,
      capacity: 100,
      location: 'Mechanical Block, 1st Floor',
      description: 'Executive conference hall with circular round-table audio.',
      features: ['Air Conditioned', 'Teleconferencing Rig'],
      isActive: true
    },
    {
      name: 'MECH Classroom 201',
      type: 'classroom',
      department: mechDept._id,
      capacity: 60,
      location: 'Mechanical Block, 2nd Floor, Room 201',
      description: 'Standard air-cooled classroom with high resolution projector.',
      features: ['Projector', 'Sound Bar'],
      isActive: true
    },
    {
      name: 'Cloud Computing & Cyber Security Lab',
      type: 'lab',
      department: itDept._id,
      capacity: 60,
      location: 'IT Block, 3rd Floor, Lab 1',
      description: 'Cloud computing lab with isolated subnet for security drills.',
      features: ['Isolated Subnet', 'Air Conditioned', 'Gigabit Switches'],
      isActive: true
    },
    {
      name: 'IT Smart Lecture Theater 305',
      type: 'classroom',
      department: itDept._id,
      capacity: 75,
      location: 'IT Block, 3rd Floor, Room 305',
      description: 'Tiered stadium lecture theater with dual projectors.',
      features: ['Tiered Stadium Seating', 'Dual Projectors'],
      isActive: true
    },
    {
      name: 'IT Department Seminar Hall',
      type: 'seminar hall',
      department: itDept._id,
      capacity: 120,
      location: 'IT Block, 4th Floor',
      description: 'Modern multi-purpose seminar hall for hackathons.',
      features: ['Air Conditioned', 'High Speed Wi-Fi 6'],
      isActive: true
    },
    {
      name: 'Sony High-Lumen Mobile Projector Unit 2',
      type: 'projector',
      department: itDept._id,
      capacity: 1,
      location: 'IT Department Lab Office',
      description: '5000 Lumens heavy-duty Sony presentation projector.',
      features: ['5000 Lumens', 'Wireless Dongle'],
      isActive: true
    }
  ]);

  const todayStr = '2026-09-30';
  const tomorrowStr = '2026-10-01';
  const nextDayStr = '2026-10-02';

  const bookings = await Booking.create([
    {
      resource: resources[0]._id,
      requestedBy: facECE1._id,
      department: eceDept._id,
      title: 'Guest Lecture on Next-Gen 6G Wireless Networks',
      purpose: 'Distinguished lecture by IEEE Fellow for final year students.',
      date: todayStr,
      startTime: '10:00',
      endTime: '12:00',
      status: 'approved',
      remarks: 'Approved by HOD CSE.',
      approvedBy: hodCSE._id,
      approvedAt: new Date()
    },
    {
      resource: resources[1]._id,
      requestedBy: facCSE1._id,
      department: cseDept._id,
      title: 'Hands-on PyTorch Workshop for CSE 3rd Year',
      purpose: 'Practical lab session covering Transformer models.',
      date: todayStr,
      startTime: '14:00',
      endTime: '16:00',
      status: 'approved',
      remarks: 'Approved. Lab 3 reserved.',
      approvedBy: hodCSE._id,
      approvedAt: new Date()
    },
    {
      resource: resources[4]._id,
      requestedBy: facIT1._id,
      department: itDept._id,
      title: 'Inter-College Hackathon Opening Ceremony',
      purpose: 'Inaugural address and team briefing session.',
      date: todayStr,
      startTime: '14:30',
      endTime: '17:00',
      status: 'pending',
      remarks: ''
    },
    {
      resource: resources[0]._id,
      requestedBy: facMECH2._id,
      department: mechDept._id,
      title: 'CAD & Robotics Society Technical Colloquium',
      purpose: 'Inter-departmental presentation of student robotics prototypes.',
      date: tomorrowStr,
      startTime: '09:30',
      endTime: '11:30',
      status: 'pending',
      remarks: ''
    },
    {
      resource: resources[5]._id,
      requestedBy: facECE2._id,
      department: eceDept._id,
      title: 'FPGA Verilog Synthesis Lab Exam Practice',
      purpose: 'Practical revision for autonomous lab evaluation.',
      date: tomorrowStr,
      startTime: '13:00',
      endTime: '15:00',
      status: 'approved',
      remarks: 'Approved by HOD ECE.',
      approvedBy: hodECE._id,
      approvedAt: new Date()
    },
    {
      resource: resources[2]._id,
      requestedBy: facIT2._id,
      department: itDept._id,
      title: 'Extra Tutorial Session for Discrete Math',
      purpose: 'Remedial coaching for second year IT students.',
      date: tomorrowStr,
      startTime: '10:00',
      endTime: '11:30',
      status: 'rejected',
      remarks: 'Room already allocated for internal departmental faculty meeting.',
      approvedBy: hodCSE._id,
      approvedAt: new Date()
    },
    {
      resource: resources[8]._id,
      requestedBy: facMECH1._id,
      department: mechDept._id,
      title: 'ANSYS FEA Thermal Simulation Practical',
      purpose: 'Aerospace structural stress testing demonstration.',
      date: nextDayStr,
      startTime: '09:00',
      endTime: '11:00',
      status: 'approved',
      remarks: 'Approved by HOD MECH.',
      approvedBy: hodMECH._id,
      approvedAt: new Date()
    },
    {
      resource: resources[12]._id,
      requestedBy: facCSE2._id,
      department: cseDept._id,
      title: 'Kubernetes Cluster DevOps Bootcamp',
      purpose: 'Faculty development programme session on container orchestration.',
      date: nextDayStr,
      startTime: '13:30',
      endTime: '16:00',
      status: 'pending',
      remarks: ''
    },
    {
      resource: resources[3]._id,
      requestedBy: facECE3._id,
      department: eceDept._id,
      title: 'ECE Project Demo in Open Corridor',
      purpose: 'Project exhibition display.',
      date: todayStr,
      startTime: '11:00',
      endTime: '13:00',
      status: 'rejected',
      remarks: 'Projector scheduled for routine preventive maintenance.',
      approvedBy: hodCSE._id,
      approvedAt: new Date()
    },
    {
      resource: resources[14]._id,
      requestedBy: facIT3._id,
      department: itDept._id,
      title: 'Alumni Mentorship Interactive Meetup',
      purpose: 'Interaction session with 2022 batch alumni.',
      date: nextDayStr,
      startTime: '15:00',
      endTime: '16:30',
      status: 'cancelled',
      remarks: 'Speaker travel rescheduled. Cancelled by faculty organizer.',
      approvedBy: null
    }
  ]);

  const examDate1 = '2026-10-03';
  const examDate2 = '2026-10-04';

  const exams = await Exam.create([
    {
      name: 'Continuous Internal Assessment I (CIA-I)',
      subject: 'CS8591 - Computer Networks',
      department: cseDept._id,
      date: examDate1,
      startTime: '09:30',
      endTime: '12:30',
      rooms: [resources[2]._id, resources[6]._id],
      invigilators: [facCSE3._id, facECE2._id],
      seatsPerRoom: 35,
      totalStudents: 70,
      roomAllocations: [
        { room: resources[2]._id, assignedInvigilator: facCSE3._id, allottedSeats: 35 },
        { room: resources[6]._id, assignedInvigilator: facECE2._id, allottedSeats: 35 }
      ],
      createdBy: hodCSE._id
    },
    {
      name: 'Autonomous Semester Model Examination',
      subject: 'EC8452 - Electronic Circuits & DSP',
      department: eceDept._id,
      date: examDate2,
      startTime: '13:30',
      endTime: '16:30',
      rooms: [resources[6]._id, resources[11]._id],
      invigilators: [facECE1._id, facMECH2._id],
      seatsPerRoom: 30,
      totalStudents: 60,
      roomAllocations: [
        { room: resources[6]._id, assignedInvigilator: facECE1._id, allottedSeats: 30 },
        { room: resources[11]._id, assignedInvigilator: facMECH2._id, allottedSeats: 30 }
      ],
      createdBy: hodECE._id
    }
  ]);

  const materials = await Material.create([
    {
      title: 'CS8591 Computer Networks - Comprehensive Units 1 to 5 Lecture Notes',
      subject: 'Computer Networks (CS8591)',
      department: cseDept._id,
      type: 'notes',
      filePath: path.join(uploadsDir, 'sample_cn_notes.pdf'),
      originalName: 'CS8591_CN_Notes_All_Units.pdf',
      fileSize: 452010,
      mimeType: 'application/pdf',
      uploadedBy: facCSE1._id,
      downloads: 28
    },
    {
      title: 'CS8481 DBMS Laboratory Practical Manual with SQL Queries & PL/SQL',
      subject: 'Database Management Systems Lab (CS8481)',
      department: cseDept._id,
      type: 'lab manual',
      filePath: path.join(uploadsDir, 'sample_dbms_lab_manual.pdf'),
      originalName: 'DBMS_Laboratory_Manual_2026.pdf',
      fileSize: 681240,
      mimeType: 'application/pdf',
      uploadedBy: facCSE2._id,
      downloads: 45
    },
    {
      title: 'EC8352 Signals and Systems 5-Year Solved Anna University Question Bank',
      subject: 'Signals and Systems (EC8352)',
      department: eceDept._id,
      type: 'question bank',
      filePath: path.join(uploadsDir, 'sample_ece_signals_qb.pdf'),
      originalName: 'ECE_Signals_Question_Bank_Solved.pdf',
      fileSize: 890400,
      mimeType: 'application/pdf',
      uploadedBy: facECE1._id,
      downloads: 62
    },
    {
      title: 'Student Performance & Placement Predictor Benchmark Dataset (CSV)',
      subject: 'Machine Learning (IT8601)',
      department: itDept._id,
      type: 'dataset',
      filePath: path.join(uploadsDir, 'sample_ai_dataset.csv'),
      originalName: 'Placement_Prediction_Clean_Dataset.csv',
      fileSize: 24500,
      mimeType: 'text/csv',
      uploadedBy: facIT1._id,
      downloads: 19
    },
    {
      title: 'Smart Campus Energy Monitoring Architecture using IoT & LoRaWAN (IEEE)',
      subject: 'Internet of Things (ME8792)',
      department: mechDept._id,
      type: 'research',
      filePath: path.join(uploadsDir, 'sample_iot_research_paper.pdf'),
      originalName: 'EEC_Campus_IoT_Energy_Paper.pdf',
      fileSize: 1120400,
      mimeType: 'application/pdf',
      uploadedBy: facMECH1._id,
      downloads: 14
    }
  ]);

  await Notification.create([
    {
      user: hodCSE._id,
      title: 'New Booking Request',
      message: 'Prof. K. Sundar requested booking for "AI & Deep Learning Computing Lab" on 2026-10-02.',
      type: 'booking_request',
      read: false,
      link: '/approvals'
    },
    {
      user: facECE1._id,
      title: 'Booking Approved',
      message: 'Your booking request for "CSE Turing Seminar Hall" on 2026-09-30 (10:00-12:00) has been approved.',
      type: 'booking_approved',
      read: true,
      link: '/my-bookings'
    },
    {
      user: facCSE3._id,
      title: 'Exam Invigilation Duty Assigned',
      message: 'You have been assigned as Invigilator for CIA-I (CS8591 Computer Networks) on 2026-10-03 in CSE Classroom 204.',
      type: 'exam_duty',
      read: false,
      link: '/exams'
    },
    {
      user: facECE2._id,
      title: 'Exam Invigilation Duty Assigned',
      message: 'You have been assigned as Invigilator for CIA-I (CS8591 Computer Networks) on 2026-10-03 in ECE Lecture Hall 102.',
      type: 'exam_duty',
      read: false,
      link: '/exams'
    }
  ]);

  await AuditLog.create([
    {
      action: 'SYSTEM_INITIALIZATION',
      performedBy: admin._id,
      entityType: 'Department',
      entityId: cseDept._id.toString(),
      details: { message: 'Database initialized with 4 departments and resource inventory.' }
    },
    {
      action: 'BOOKING_APPROVED',
      performedBy: hodCSE._id,
      entityType: 'Booking',
      entityId: bookings[0]._id.toString(),
      details: { resource: 'CSE Turing Seminar Hall', requester: 'Prof. B. Suresh', date: todayStr }
    },
    {
      action: 'EXAM_TIMETABLE_CREATED',
      performedBy: hodCSE._id,
      entityType: 'Exam',
      entityId: exams[0]._id.toString(),
      details: { examName: 'Continuous Internal Assessment I (CIA-I)', subject: 'CS8591 - Computer Networks' }
    },
    {
      action: 'MATERIAL_UPLOADED',
      performedBy: facCSE1._id,
      entityType: 'Material',
      entityId: materials[0]._id.toString(),
      details: { title: 'CS8591 Computer Networks - Comprehensive Lecture Notes' }
    }
  ]);

  console.log('[Seed] Auto-initialization completed successfully.');
};

module.exports = { runSeed };
