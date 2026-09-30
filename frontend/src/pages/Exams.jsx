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
