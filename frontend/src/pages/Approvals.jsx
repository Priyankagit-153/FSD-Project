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
