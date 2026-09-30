import React from 'react';
import { Menu, User, Sparkles, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Left Side: Mobile toggle + College Banner */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-college-50 border border-college-200 text-college-700">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-college-900 tracking-tight flex items-center gap-1.5">
                <span>Department of CSE</span>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-college-700 font-bold">Easwari Engineering College</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden md:block">
                Inter-Departmental Planning & Resource Sharing Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* In-app Notification Bell */}
          <NotificationDropdown />

          {/* User Profile Pill */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-college-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                {user?.name}
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-[9px] font-extrabold text-college-700 uppercase tracking-wider bg-college-50 px-1.5 py-0.5 rounded border border-college-200/60">
                  {user?.role}
                </span>
                {user?.department?.code && (
                  <span className="text-[10px] text-slate-500 font-semibold">
                    ({user?.department?.code})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
