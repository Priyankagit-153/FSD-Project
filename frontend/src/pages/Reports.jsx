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
