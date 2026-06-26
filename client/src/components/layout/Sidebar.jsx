import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Code2, 
  BrainCircuit, 
  AlertTriangle,
  Target,
  Trophy,
  Users,
  Calendar,
  Server,
  Briefcase,
  X,
  FileText
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [dueRevisionCount, setDueRevisionCount] = React.useState(0);

  React.useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/revision/schedule`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data?.revisions) {
          setDueRevisionCount(data.data.revisions.length);
        }
      } catch (e) {
        console.error('Failed to fetch revisions:', e);
      }
    };
    fetchRevisions();
  }, []);
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Daily Task', icon: Target, path: '/tasks' },
    { name: 'Analytics', icon: BrainCircuit, path: '/analytics' },
    { name: 'Revision', icon: Calendar, path: '/revision' },
    { name: 'Resume ATS', icon: FileText, path: '/resume' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:h-[calc(100vh-4rem)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Button */}
        <div className="flex justify-end p-4 md:hidden border-b border-slate-800">
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                      ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.name === 'Revision' && dueRevisionCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 py-0.5 px-2 rounded-full text-xs font-bold border border-red-500/30">
                    {dueRevisionCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
      
      {/* User Level Badge */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div>
            <p className="text-xs text-slate-400 font-medium">Current Level</p>
            <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400 capitalize">
              {user?.level?.level || 'Beginner'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center border border-primary-500/30">
            <span className="text-primary-300 font-bold text-xs">Lvl 1</span>
          </div>
        </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
