import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, GripVertical, Building2, Calendar, MapPin, X, Loader2 } from 'lucide-react';
import jobApi from '../../services/jobApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const COLUMNS = ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'];

const PlacementTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    status: 'Wishlist',
    notes: ''
  });
  
  const [draggedJobId, setDraggedJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobApi.getJobs();
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedJobId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag visual to generate before making it transparent
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedJobId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!draggedJobId) return;

    const jobToMove = jobs.find(j => j.id === draggedJobId);
    if (!jobToMove || jobToMove.status === targetStatus) return;

    // Optimistic UI update
    setJobs(prev => prev.map(j => 
      j.id === draggedJobId ? { ...j, status: targetStatus } : j
    ));

    // API Call
    try {
      const res = await jobApi.updateJobStatus(draggedJobId, { status: targetStatus });
      if (!res.success) {
        toast.error('Failed to update status');
        fetchJobs(); // Revert on failure
      }
    } catch (error) {
      fetchJobs();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await jobApi.addJob(formData);
      if (res.success) {
        toast.success('Job added!');
        setJobs([res.data, ...jobs]);
        setIsModalOpen(false);
        setFormData({ company_name: '', role: '', status: 'Wishlist', notes: '' });
      } else {
        toast.error(res.error || 'Failed to add job');
      }
    } catch (error) {
      toast.error('Error adding job');
    }
  };

  const renderColumn = (status) => {
    const columnJobs = jobs.filter(j => j.status === status);
    
    // Aesthetic color mapping
    const getHeaderColor = () => {
      switch(status) {
        case 'Wishlist': return 'border-slate-500 text-slate-300';
        case 'Applied': return 'border-blue-500 text-blue-400';
        case 'Interviewing': return 'border-amber-500 text-amber-400';
        case 'Offered': return 'border-emerald-500 text-emerald-400';
        case 'Rejected': return 'border-rose-500 text-rose-400';
        default: return 'border-slate-500 text-slate-300';
      }
    };

    return (
      <div 
        key={status}
        className="flex-1 min-w-[280px] bg-dark-800/50 rounded-xl border border-slate-800 flex flex-col"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className={`p-4 border-b-2 ${getHeaderColor()} flex justify-between items-center bg-dark-800 rounded-t-xl`}>
          <h3 className="font-bold uppercase tracking-wider text-sm">{status}</h3>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">{columnJobs.length}</span>
        </div>
        
        <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
          {columnJobs.map(job => (
            <div
              key={job.id}
              draggable
              onDragStart={(e) => handleDragStart(e, job.id)}
              onDragEnd={handleDragEnd}
              className="bg-slate-800 border border-slate-700 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-slate-600 transition-colors shadow-sm group"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white text-sm break-words">{job.role}</h4>
                <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                <Building2 className="w-3 h-3" />
                <span>{job.company_name}</span>
              </div>
              {job.date_applied && (
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(job.date_applied).toLocaleDateString()}</span>
                </div>
              )}
              {job.notes && (
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 bg-dark-900/50 p-2 rounded border border-slate-800/50">
                  {job.notes}
                </p>
              )}
            </div>
          ))}
          
          {columnJobs.length === 0 && (
            <div className="h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm">
              Drop here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Briefcase className="text-primary-500 w-8 h-8" />
            Placement Tracker
          </h1>
          <p className="text-slate-400 mt-2">
            Organize your job applications. Drag and drop cards to update their status.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Application
        </Button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
           <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map(renderColumn)}
        </div>
      )}

      {/* Add Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add Application</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({...formData, company_name: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500" 
                  placeholder="e.g. Google"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <input 
                  type="text" 
                  required
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500" 
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes (Optional)</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 h-24 resize-none" 
                  placeholder="Any details, links, or contacts..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Job</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementTracker;
