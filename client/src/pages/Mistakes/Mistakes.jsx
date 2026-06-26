import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw, BrainCircuit, Activity } from 'lucide-react';
import mistakeApi from '../../services/mistakeApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Mistakes = () => {
  const [mistakes, setMistakes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unrevised'); // unrevised | revised

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mistakesRes, statsRes] = await Promise.all([
        mistakeApi.getMistakes({ is_revised: activeTab === 'revised' }),
        mistakeApi.getMistakeStats()
      ]);
      
      if (mistakesRes.success) setMistakes(mistakesRes.data.mistakes);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch mistakes:", error);
      toast.error("Failed to load mistake data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRevised = async (id) => {
    try {
      const res = await mistakeApi.markRevised(id);
      if (res.success) {
        toast.success("Marked as revised!");
        // Optimistic UI update
        setMistakes(prev => prev.filter(m => m.id !== id));
        fetchData(); // Refresh stats
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="text-rose-500 w-8 h-8" />
            Mistake Notebook
          </h1>
          <p className="text-slate-400 mt-2">
            "A person who never made a mistake never tried anything new." – Albert Einstein
          </p>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4 border-l-4 border-l-rose-500">
            <div className="p-3 bg-rose-500/20 rounded-lg text-rose-500"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Mistakes</p>
              <h3 className="text-2xl font-bold text-white">{stats.total_mistakes}</h3>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-500"><RotateCcw className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-400">Needs Revision</p>
              <h3 className="text-2xl font-bold text-white">{stats.unrevised}</h3>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-400">Successfully Revised</p>
              <h3 className="text-2xl font-bold text-white">{stats.total_revised}</h3>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'unrevised' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'}`}
          onClick={() => setActiveTab('unrevised')}
        >
          Needs Review ({stats?.unrevised || 0})
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'revised' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'}`}
          onClick={() => setActiveTab('revised')}
        >
          Understood ({stats?.total_revised || 0})
        </button>
      </div>

      {/* List */}
      <Card className="p-0 overflow-hidden border border-slate-800">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : mistakes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300">No mistakes here!</h3>
            <p className="mt-2">You don't have any {activeTab === 'unrevised' ? 'pending' : 'completed'} revisions.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {Object.entries(
              mistakes.reduce((acc, mistake) => {
                const cat = mistake.question?.category?.replace('_', ' ') || 'other';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(mistake);
                return acc;
              }, {})
            ).map(([category, catMistakes]) => (
              <div key={category} className="pb-4">
                <div className="bg-slate-800/50 px-6 py-2 border-b border-slate-700/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider capitalize">{category}</h2>
                  <Badge variant="default">{catMistakes.length}</Badge>
                </div>
                <div className="divide-y divide-slate-800/30">
                  {catMistakes.map(mistake => (
                    <div key={mistake.id} className="p-6 hover:bg-slate-800/20 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-slate-500 font-medium">{new Date(mistake.created_at).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-lg font-medium text-white mb-3">{mistake.question?.title}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-rose-900/10 border border-rose-500/20 p-3 rounded-lg">
                              <p className="text-xs text-rose-400 uppercase font-semibold mb-1">Your Answer</p>
                              <p className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{mistake.user_answer}</p>
                            </div>
                            <div className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-lg">
                              <p className="text-xs text-emerald-400 uppercase font-semibold mb-1">Correct Answer</p>
                              <p className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{mistake.correct_answer}</p>
                            </div>
                          </div>
                        </div>
                        
                        {activeTab === 'unrevised' && (
                          <Button 
                            variant="outline" 
                            className="shrink-0 flex items-center gap-2"
                            onClick={() => handleMarkRevised(mistake.id)}
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark as Understood
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
    </div>
  );
};

export default Mistakes;
