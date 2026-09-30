import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const ResourceDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState({ bookings: [], exams: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/resources/${id}?date=${selectedDate}`);
        setResource(res.data.data);
        setSchedule(res.data.schedule);
      } catch (err) {
        console.error('Failed to load resource details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, selectedDate]);

  if (loading && !resource) {
    return <LoadingSpinner fullPage text="Retrieving resource schedule..." />;
  }

  if (!resource) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-800">Resource not found</h2>
        <Link to="/resources" className="mt-4 inline-flex items-center text-xs font-bold text-college-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Resources
        </Link>
      </div>
    );
  }

  const approvedBookings = (schedule.bookings || []).filter(b => b.status === 'approved');
  const pendingBookings = (schedule.bookings || []).filter(b => b.status === 'pending');
  const exams = schedule.exams || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-college-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resources Catalogue</span>
        </Link>
      </div>

      {/* Main Resource Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-college-50 text-college-800 border border-college-200">
                {resource.type}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Dept of {resource.department?.code} - {resource.department?.name}
              </span>
              {resource.isActive ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Inactive
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {resource.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {resource.description || 'Institutional facility designated for classroom lectures, technical labs, and department gatherings.'}
            </p>

            {/* Spec pills */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-700">
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-college-600" />
                <span className="font-semibold">{resource.location}</span>
              </div>
              {resource.capacity > 0 && (
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
                  <Users className="w-4 h-4 text-college-600" />
                  <span className="font-semibold">{resource.capacity} Students Capacity</span>
                </div>
              )}
            </div>

            {/* Amenities & Hardware */}
            {resource.features && resource.features.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Equipment & Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {resource.features.map((feat, idx) => (
                    <span key={idx} className="text-xs text-slate-700 bg-college-50/60 border border-college-100 font-medium px-2.5 py-1 rounded-lg">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Book CTA Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 lg:w-72 shrink-0 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Need this resource?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Any faculty member across departments can submit a reservation request.
              </p>
            </div>
            <Link
              to={`/book-resource?resourceId=${resource._id}&date=${selectedDate}`}
              className="mt-4 w-full py-2.5 px-4 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-college-600/30 transition text-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book This Facility</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Day Timetable & Availability Visualizer */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-college-600" />
              <span>Live Daily Schedule & Availability</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select date to review approved bookings, pending requests, and scheduled exams.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
            />
          </div>
        </div>

        {/* Schedule Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Confirmed Bookings</span>
            <p className="text-lg font-extrabold text-emerald-900 mt-0.5">{approvedBookings.length}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
            <span className="text-[10px] font-bold text-blue-700 uppercase">Exams Scheduled</span>
            <p className="text-lg font-extrabold text-blue-900 mt-0.5">{exams.length}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50">
            <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Requests</span>
            <p className="text-lg font-extrabold text-amber-900 mt-0.5">{pendingBookings.length}</p>
          </div>
        </div>

        {/* Schedule List */}
        {approvedBookings.length === 0 && exams.length === 0 && pendingBookings.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Resource Completely Free on {selectedDate}</h4>
            <p className="text-xs text-slate-500 mt-1">No reservations or exams scheduled for this date. All time slots are open for booking.</p>
            <Link
              to={`/book-resource?resourceId=${resource._id}&date=${selectedDate}`}
              className="mt-3 inline-flex items-center text-xs font-bold text-college-600 hover:underline"
            >
              Submit booking request for this day &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Occupied & Reserved Time Slots for {selectedDate}
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {/* Exams */}
              {exams.map((ex) => (
                <div key={ex._id} className="p-4 bg-purple-50/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
                      {ex.startTime} - {ex.endTime}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        [EXAM] {ex.name} ({ex.subject})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Organized by Dept of {ex.department?.code} • Rooms allotted
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                    Examination
                  </span>
                </div>
              ))}

              {/* Approved Bookings */}
              {approvedBookings.map((b) => (
                <div key={b._id} className="p-4 bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                      {b.startTime} - {b.endTime}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{b.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Booked by {b.requestedBy?.name} (Dept of {b.department?.code || b.requestedBy?.department?.code})
                      </p>
                    </div>
                  </div>
                  <Badge variant="approved">Approved</Badge>
                </div>
              ))}

              {/* Pending Bookings */}
              {pendingBookings.map((b) => (
                <div key={b._id} className="p-4 bg-amber-50/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                      {b.startTime} - {b.endTime}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Requested by {b.requestedBy?.name} (Dept of {b.department?.code || b.requestedBy?.department?.code})
                      </p>
                    </div>
                  </div>
                  <Badge variant="pending">Pending Approval</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetail;
