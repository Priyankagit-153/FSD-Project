import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Users,
  MapPin,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Resources = () => {
  const { user, isAdmin, isHOD } = useAuth();
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [minCapacity, setMinCapacity] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'classroom',
    department: '',
    capacity: 60,
    location: '',
    description: '',
    features: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDept) params.department = selectedDept;
      if (selectedType) params.type = selectedType;
      if (minCapacity) params.minCapacity = minCapacity;

      const res = await api.get('/resources', { params });
      setResources(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedDept, selectedType, minCapacity]);

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      type: 'classroom',
      department: user.department?._id || (departments[0]?._id || ''),
      capacity: 60,
      location: '',
      description: '',
      features: 'Air Conditioned, Projector, Wi-Fi',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r) => {
    setEditingResource(r);
    setFormData({
      name: r.name,
      type: r.type,
      department: r.department?._id || r.department,
      capacity: r.capacity,
      location: r.location,
      description: r.description || '',
      features: (r.features || []).join(', '),
      isActive: r.isActive
    });
    setIsModalOpen(true);
  };

  const handleDeleteResource = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Resource deleted successfully.');
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resource.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingResource) {
        await api.put(`/resources/${editingResource._id}`, formData);
        toast.success('Resource updated successfully.');
      } else {
        await api.post('/resources', formData);
        toast.success('Resource created successfully.');
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const canManageResource = (r) => {
    if (isAdmin) return true;
    if (isHOD && user.department?._id === (r.department?._id || r.department)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Academic Resources
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover, inspect live schedules, and request bookings across all EEC departments.
          </p>
        </div>
        {(isAdmin || isHOD) && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, location, equipment..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                Dept of {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Resource Types</option>
            <option value="classroom">Classroom</option>
            <option value="lab">Computing & Hardware Lab</option>
            <option value="seminar hall">Seminar Hall & Auditorium</option>
            <option value="projector">Portable Projector</option>
            <option value="equipment">Specialized Equipment</option>
          </select>
        </div>

        {/* Min Capacity Filter */}
        <div>
          <input
            type="number"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            placeholder="Min Capacity (e.g. 50)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            min="0"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching resource catalogue..." />
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No resources found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or changing search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header row: Type badge + Department badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-college-50 text-college-800 border border-college-200/60">
                    {r.type}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Dept of {r.department?.code || 'N/A'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-college-700 transition-colors">
                  {r.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {r.description || 'No detailed description provided.'}
                </p>

                {/* Location and Capacity specs */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </div>
                  {r.capacity > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Seating Capacity: <strong className="text-slate-800">{r.capacity} seats</strong></span>
                    </div>
                  )}
                </div>

                {/* Amenities / Features tags */}
                {r.features && r.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.features.slice(0, 3).map((feat, idx) => (
                      <span key={idx} className="text-[10px] text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                        {feat}
                      </span>
                    ))}
                    {r.features.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{r.features.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/resources/${r._id}`}
                  className="text-xs font-bold text-college-700 hover:text-college-900 inline-flex items-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Check Availability</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/book-resource?resourceId=${r._id}`}
                    className="px-2.5 py-1.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                  >
                    Book Now
                  </Link>

                  {canManageResource(r) && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(r)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(r._id, r.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResource ? 'Edit Academic Resource' : 'Add New Academic Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Turing Seminar Hall / AI Computing Lab"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resource Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="seminar hall">Seminar Hall</option>
                <option value="projector">Projector</option>
                <option value="equipment">Specialized Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Owning Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={isHOD && !isAdmin}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white disabled:bg-slate-100"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Capacity (Seats)
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location / Block
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. CSE Block, 3rd Floor, Room 301"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Features & Amenities (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Air Conditioned, Dual Projectors, Surround Sound"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="State-of-the-art auditorium with 150 seating capacity and audio system..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-college-600 rounded focus:ring-college-500"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">
              Active for Booking & Scheduling
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-college-600 hover:bg-college-700 text-white rounded-xl text-xs font-bold shadow-md shadow-college-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingResource ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;
