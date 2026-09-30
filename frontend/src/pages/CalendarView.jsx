import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  Clock,
  User,
  GraduationCap,
  CalendarCheck2,
  Info
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedResource, setSelectedResource] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending'

  // Selected Day Details Modal
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resRes, bookRes, examRes] = await Promise.all([
          api.get('/resources'),
          api.get('/bookings?allApproved=true'),
          api.get('/exams')
        ]);
        setResources(resRes.data.data);
        setBookings(bookRes.data.data);
        setExams(examRes.data.data);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Build Month Grid days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (selectedResource && b.resource?._id !== selectedResource) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  // Filter Exams
  const filteredExams = exams.filter((ex) => {
    if (selectedResource) {
      const roomMatch = (ex.rooms || []).some(r => r._id === selectedResource);
      if (!roomMatch) return false;
    }
    return true;
  });

  const getEventsForDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayBookings = filteredBookings.filter(b => b.date === dateStr);
    const dayExams = filteredExams.filter(e => e.date === dateStr);
    return { bookings: dayBookings, exams: dayExams, total: dayBookings.length + dayExams.length };
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-college-600" />
            <span>Campus Master Schedule & Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visual schedule of approved reservations, pending bookings, and examination room assignments.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs font-extrabold text-college-700 hover:bg-college-50 rounded-lg transition"
          >
            Today
          </button>
          <span className="text-sm font-extrabold text-slate-800 px-3 min-w-[130px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Resource Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-600">Resource:</label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white max-w-[200px]"
            >
              <option value="">All Campus Resources</option>
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  [{r.department?.code}] {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-600">Filter By:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-college-500 bg-white"
            >
              <option value="all">All Events & Exams</option>
              <option value="approved">Approved Bookings Only</option>
              <option value="pending">Pending Bookings Only</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Approved</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Exam</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <LoadingSpinner text="Rendering calendar events..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-extrabold text-slate-600 uppercase tracking-wider py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[500px]">
            {days.map((day, idx) => {
              const { bookings: dayBookings, exams: dayExams, total } = getEventsForDay(day);
              const inCurrentMonth = isSameMonth(day, currentDate);
              const today = isToday(day);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[100px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                    !inCurrentMonth
                      ? 'bg-slate-50/40 text-slate-300'
                      : 'hover:bg-slate-50/80'
                  } ${today ? 'bg-college-50/30' : ''}`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                        today
                          ? 'bg-college-600 text-white shadow-xs'
                          : inCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {total > 0 && inCurrentMonth && (
                      <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                        {total}
                      </span>
                    )}
                  </div>

                  {/* Event badges snippet */}
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {/* Exams */}
                    {dayExams.slice(0, 2).map((ex) => (
                      <div
                        key={ex._id}
                        className="truncate text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200"
                        title={`[Exam] ${ex.name} (${ex.startTime}-${ex.endTime})`}
                      >
                        🎓 {ex.startTime} {ex.name}
                      </div>
                    ))}

                    {/* Bookings */}
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b._id}
                        className={`truncate text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          b.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                        title={`${b.title} (${b.startTime}-${b.endTime})`}
                      >
                        {b.startTime} {b.title}
                      </div>
                    ))}

                    {total > 3 && (
                      <span className="text-[9px] font-extrabold text-slate-400 block text-right pr-1">
                        +{total - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `Daily Timetable: ${format(selectedDay, 'EEEE, MMMM d, yyyy')}` : ''}
      >
        {selectedDay && (() => {
          const { bookings: dayBookings, exams: dayExams } = getEventsForDay(selectedDay);

          return (
            <div className="space-y-4">
              {dayBookings.length === 0 && dayExams.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No scheduled bookings or exams for this date.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All departmental classrooms and labs are available.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
                  {/* Exams */}
                  {dayExams.map((ex) => (
                    <div key={ex._id} className="p-4 bg-purple-50/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Examination Timetable
                        </span>
                        <span className="text-xs font-extrabold text-purple-900">
                          {ex.startTime} - {ex.endTime}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1">{ex.name}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">{ex.subject}</p>
                      <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                        <p>Rooms: <strong className="text-slate-700">{ex.rooms?.map(r => r.name).join(', ')}</strong></p>
                        <p>Invigilators: <strong className="text-slate-700">{ex.invigilators?.map(i => i.name).join(', ')}</strong></p>
                      </div>
                    </div>
                  ))}

                  {/* Bookings */}
                  {dayBookings.map((b) => (
                    <div key={b._id} className="p-4 hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between">
                        <Badge variant={b.status}>{b.status}</Badge>
                        <span className="text-xs font-extrabold text-slate-800">
                          {b.startTime} - {b.endTime}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1">{b.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Facility: <strong className="text-slate-700">{b.resource?.name}</strong> ({b.resource?.location})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Booked by: <strong className="text-slate-700">{b.requestedBy?.name}</strong> (Dept of {b.department?.code || b.requestedBy?.department?.code})
                      </p>
                      {b.remarks && (
                        <p className="text-[10px] text-slate-600 italic mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                          Remarks: {b.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default CalendarView;
