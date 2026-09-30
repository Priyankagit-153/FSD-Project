import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  CalendarDays,
  FileCheck2,
  GraduationCap,
  FolderArchive,
  Bell,
  BarChart3,
  ShieldAlert,
  Users2,
  PlusCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isAdmin, isHOD, isFaculty } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Explore Resources', href: '/resources', icon: Building2, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Book a Resource', href: '/book-resource', icon: PlusCircle, roles: ['admin', 'hod', 'faculty'], highlight: true },
    { name: 'My Bookings', href: '/my-bookings', icon: CalendarCheck2, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Approvals', href: '/approvals', icon: FileCheck2, roles: ['admin', 'hod'] },
    { name: 'Master Calendar', href: '/calendar', icon: CalendarDays, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Exam Planning', href: '/exams', icon: GraduationCap, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Academic Hub', href: '/academic-hub', icon: FolderArchive, roles: ['admin', 'hod', 'faculty'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['admin', 'hod', 'faculty'] },
    // Admin Only Links
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, roles: ['admin'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert, roles: ['admin'] },
    { name: 'Users & Depts', href: '/user-management', icon: Users2, roles: ['admin'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Brand logo & header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-college-500 to-college-700 flex items-center justify-center text-white font-bold shadow-md shadow-college-900/30 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              Easwari Engg College
            </h1>
            <p className="text-[11px] font-medium text-college-300 truncate">
              Dept of CSE • Resource Hub
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </div>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-college-600 text-white shadow-md shadow-college-700/30'
                      : item.highlight
                      ? 'text-college-300 hover:text-white hover:bg-slate-800/80 border border-college-500/20 bg-college-950/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="uppercase text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-college-600 text-white tracking-wide">
                  {user?.role}
                </span>
                {user?.department?.code && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {user?.department?.code}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
