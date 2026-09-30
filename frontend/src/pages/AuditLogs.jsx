import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entityType = entityFilter;

      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const getActionBadgeColor = (action) => {
    if (action.includes('APPROVED') || action.includes('CREATED')) return 'emerald';
    if (action.includes('REJECTED') || action.includes('DELETED')) return 'rose';
    if (action.includes('CANCELLED')) return 'amber';
    return 'blue';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-college-700 uppercase tracking-wider bg-college-50 border border-college-200 px-2.5 py-1 rounded-full">
          Institutional Compliance & Governance
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-purple-600" />
          <span>Security Audit Trail & Activity Logs</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit record of all reservations, approvals, rejections, exam creations, and resource changes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        {/* Action Search */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter by Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Actions</option>
            <option value="BOOKING_APPROVED">BOOKING_APPROVED</option>
            <option value="BOOKING_REJECTED">BOOKING_REJECTED</option>
            <option value="BOOKING_REQUEST_CREATED">BOOKING_REQUEST_CREATED</option>
            <option value="BOOKING_CANCELLED">BOOKING_CANCELLED</option>
            <option value="EXAM_TIMETABLE_CREATED">EXAM_TIMETABLE_CREATED</option>
            <option value="MATERIAL_UPLOADED">MATERIAL_UPLOADED</option>
            <option value="RESOURCE_CREATE">RESOURCE_CREATE</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
          </select>
        </div>

        {/* Entity Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Entity Type</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Entities</option>
            <option value="Booking">Booking</option>
            <option value="Exam">Exam</option>
            <option value="Resource">Resource</option>
            <option value="Material">Material</option>
            <option value="User">User</option>
            <option value="Department">Department</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner text="Querying audit records..." />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Audit Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the action or entity filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        log.action.includes('APPROVED') ? 'bg-emerald-100 text-emerald-800' :
                        log.action.includes('REJECTED') ? 'bg-rose-100 text-rose-800' :
                        log.action.includes('EXAM') ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {log.entityType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {log.performedBy ? (
                        <div>
                          <p className="font-bold text-slate-800">{log.performedBy.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {log.performedBy.email} ({log.performedBy.role})
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Auto</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                      <pre className="text-[10px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
