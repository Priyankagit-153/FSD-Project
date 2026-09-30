import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  Search,
  MessageSquare,
  Ban
} from 'lucide-react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings?my=true');
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel the booking for "${title}"?`)) return;
    try {
      await api.put(`/bookings/${id}/cancel`, { remarks: 'Cancelled by requester' });
      toast.success('Booking cancelled.');
      fetchMyBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesTab = activeTab === 'all' || b.status === activeTab;
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.date.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Resource Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status, review HOD remarks, and manage your reservation requests.
          </p>
        </div>
        <Link
          to="/book-resource"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b md:border-b-0 pb-3 md:pb-0">
          {[
            { id: 'all', label: 'All Bookings', count: counts.all },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
            { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-college-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-college-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
          />
        </div>
      </div>

      {/* Bookings List Table / Cards */}
      {loading ? (
        <LoadingSpinner text="Loading your reservation history..." />
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CalendarCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No bookings in this category</h3>
          <p className="text-xs text-slate-500 mt-1">You have not submitted any reservations matching this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Event / Purpose</th>
                  <th className="py-3.5 px-4">Resource & Location</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">HOD / Remarks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 max-w-xs">
                      <p className="truncate">{b.title}</p>
                      {b.purpose && (
                        <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">{b.purpose}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      <p className="font-semibold text-slate-800">{b.resource?.name || 'Resource'}</p>
                      <p className="text-[11px] text-slate-400">
                        {b.resource?.location} • Dept of {b.resource?.department?.code || 'EEC'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      <p className="font-bold text-slate-800">{b.date}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{b.startTime} - {b.endTime}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={b.status}>{b.status}</Badge>
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs">
                      {b.remarks ? (
                        <div className="flex items-start space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-[11px] italic">{b.remarks}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                      {b.approvedBy && (
                        <p className="text-[10px] text-slate-400 mt-0.5">By {b.approvedBy?.name}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {['pending', 'approved'].includes(b.status) && (
                        <button
                          onClick={() => handleCancelBooking(b._id, b.title)}
                          className="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
                          title="Cancel Booking"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      )}
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

export default MyBookings;
