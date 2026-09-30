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
