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
