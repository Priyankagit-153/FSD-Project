import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  FileCode,
  FileSpreadsheet,
  File,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AcademicHub = () => {
  const { user, isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    department: '',
    type: 'notes',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDept) params.department = selectedDept;
      if (selectedType) params.type = selectedType;

      const [matRes, deptRes] = await Promise.all([
        api.get('/materials', { params }),
        api.get('/departments')
      ]);
      setMaterials(matRes.data.data);
      setDepartments(deptRes.data.data);
      if (!uploadData.department && deptRes.data.data.length > 0) {
        setUploadData(prev => ({ ...prev, department: user.department?._id || deptRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load academic materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm, selectedDept, selectedType]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds the 10MB limit.');
        return;
      }
      setUploadData({ ...uploadData, file: selected });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    formData.append('department', uploadData.department || user.department?._id);
    formData.append('type', uploadData.type);
    formData.append('file', uploadData.file);

    try {
      await api.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Academic material uploaded successfully!');
      setIsModalOpen(false);
      setUploadData({
        title: '',
        subject: '',
        department: user.department?._id || '',
        type: 'notes',
        file: null
      });
      fetchMaterials();
    } catch (err) {
      const msg = err.response?.data?.message || 'File upload failed.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (id, fileName) => {
    // Open download endpoint
    const token = localStorage.getItem('token');
    window.open(`/api/materials/${id}/download?token=${token}`, '_blank');
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Material deleted.');
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete material.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-college-700 uppercase tracking-wider bg-college-50 border border-college-200 px-2.5 py-1 rounded-full">
            Knowledge Sharing Hub
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Inter-Departmental Academic Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access and contribute lecture notes, laboratory manuals, question banks, research datasets, and papers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-college-600 hover:bg-college-700 text-white font-bold rounded-xl text-xs shadow-md shadow-college-600/30 transition self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Academic Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, subject, filename..."
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

        {/* Material Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
          >
            <option value="">All Material Types</option>
            <option value="notes">Lecture Notes</option>
            <option value="lab manual">Lab Manual</option>
            <option value="question bank">Question Bank</option>
            <option value="dataset">Dataset / Project Code</option>
            <option value="research">Research Publication</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <LoadingSpinner text="Retrieving repository index..." />
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Materials Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting search filters or upload a new resource.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((m) => {
            const isOwner = user?._id === (m.uploadedBy?._id || m.uploadedBy) || isAdmin;

            return (
              <div
                key={m._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-college-50 text-college-800 border border-college-200">
                      {m.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Dept of {m.department?.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2">
                    {m.title}
                  </h3>

                  <p className="text-xs font-semibold text-college-700">
                    {m.subject}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p className="truncate">File: <strong className="text-slate-700">{m.originalName}</strong></p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatFileSize(m.fileSize)}</span>
                      <span>{m.downloads} downloads</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Uploaded by <strong className="text-slate-600">{m.uploadedBy?.name || 'Faculty'}</strong> on {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDownload(m._id, m.originalName)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-college-600 hover:bg-college-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(m._id, m.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Academic Hub Material (Up to 10MB)"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Material Title
            </label>
            <input
              type="text"
              required
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              placeholder="e.g. CS8591 Computer Networks Units 1-5 Lecture Slides"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject Code & Name
              </label>
              <input
                type="text"
                required
                value={uploadData.subject}
                onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                placeholder="CS8591 - Computer Networks"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Material Type
              </label>
              <select
                value={uploadData.type}
                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
              >
                <option value="notes">Lecture Notes</option>
                <option value="lab manual">Lab Manual</option>
                <option value="question bank">Question Bank</option>
                <option value="dataset">Dataset / Code</option>
                <option value="research">Research Publication</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={uploadData.department}
              onChange={(e) => setUploadData({ ...uploadData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  Dept of {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Document File (PDF, DOCX, PPTX, ZIP, CSV - Max 10MB)
            </label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-college-50 file:text-college-700 hover:file:bg-college-100 cursor-pointer"
            />
          </div>

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
              disabled={uploading}
              className="px-5 py-2 bg-college-600 hover:bg-college-700 text-white rounded-xl text-xs font-bold shadow-md shadow-college-600/30 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading to Hub...' : 'Upload File'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicHub;
