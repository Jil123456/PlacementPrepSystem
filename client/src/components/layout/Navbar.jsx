import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Flame, GraduationCap, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 bg-dark-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        
        {/* Logo and Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-slate-300 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <Link to="/" className="text-lg font-bold text-white tracking-tight hidden sm:block">
            Placement<span className="text-primary-400">Prep</span>
          </Link>
        </div>
        </div>

        {/* Right Section */}
        {user && (
          <div className="flex items-center gap-4">
            
            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-sm font-semibold text-orange-500">Day {user.current_day || 1}</span>
            </div>

            {/* Profile Dropdown (Simplified for now) */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-medium text-slate-200">{user.name}</span>
                <span className="text-xs text-slate-400 capitalize">{user.company_mode || 'Product'} Mode</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors">
                <User className="w-4 h-4" />
              </button>
              <button 
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
