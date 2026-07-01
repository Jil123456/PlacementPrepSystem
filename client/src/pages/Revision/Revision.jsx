import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import revisionApi from '../../services/revisionApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SM2RatingWidget from '../../components/SM2RatingWidget';
import { useAuth } from '../../context/AuthContext';

const Revision = () => {
  const { user } = useAuth();
  const [revisions, setRevisions] = useState([]);
  const [activeRatingId, setActiveRatingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    try {
      const response = await revisionApi.getTodayRevision();
      if (response.success) {
        setRevisions(response.data.revisions || []);
        setRoadmapDays(response.data.revision_days || []);
      }
    } catch (error) {
      console.error("Failed to fetch revisions:", error);
      toast.error("Failed to load revision schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (questionId, quality) => {
    try {
      const response = await revisionApi.rateQuestion(questionId, quality);
      if (response.success) {
        toast.success(`Revision marked as complete! Next date: ${new Date(response.data.revision.next_revision_date).toLocaleDateString()}`);
        setRevisions(prev => prev.map(r => r.question.id === questionId ? { ...r, is_completed: true } : r));
        setActiveRatingId(null);
      }
    } catch (error) {
      toast.error("Failed to complete revision");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingCount = revisions.filter(r => !r.is_completed).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-indigo-500 w-8 h-8" />
            Spaced Repetition Calendar
          </h1>
          <p className="text-slate-400 mt-2">
            Scientifically timed reviews based on the Ebbinghaus forgetting curve. Reviewing these topics today guarantees long-term retention.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden border border-slate-800">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Today's Revisions</h2>
              <Badge variant={pendingCount === 0 ? 'success' : 'warning'}>
                {pendingCount} Pending
              </Badge>
            </div>
            
            {revisions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300">You're all caught up!</h3>
                <p className="mt-2">No past topics are scheduled for revision today.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {revisions.map(rev => {
                  return (
                    <div key={rev.id} className={`p-6 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${rev.is_completed ? 'bg-slate-900/50 opacity-60' : 'hover:bg-slate-800/20'}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="primary">Day {rev.target_roadmap_day}</Badge>
                          {rev.question && (
                            <Badge variant={rev.question.difficulty === 'hard' ? 'danger' : rev.question.difficulty === 'medium' ? 'warning' : 'success'}>
                              {rev.question.difficulty}
                            </Badge>
                          )}
                          <span className="text-sm text-slate-500">Scheduled for today</span>
                        </div>
                        <h3 className={`text-lg font-medium ${rev.is_completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {rev.question ? rev.question.title : `Day ${rev.target_roadmap_day} Topics`}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">Review your notes and mistakes for this problem.</p>
                      </div>
                      
                      <div className="shrink-0 flex items-center gap-3 relative">
                        {rev.question && !rev.is_completed && (
                          <Button variant="secondary" onClick={() => window.open(`/practice/question/${rev.question.id}`, '_blank')}>
                            Practice Again
                          </Button>
                        )}
                        {rev.is_completed ? (
                          <div className="flex items-center gap-2 text-emerald-500 font-medium px-4 py-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" /> Done
                          </div>
                        ) : activeRatingId === rev.id ? (
                          <div className="absolute right-0 top-full mt-2 z-10 w-80 shadow-2xl">
                            <SM2RatingWidget 
                              onRate={(q) => handleComplete(rev.question.id, q)} 
                              interval={rev.interval}
                              repetitions={rev.repetitions}
                              easinessFactor={rev.easiness_factor}
                            />
                          </div>
                        ) : (
                          <Button variant="outline" onClick={() => setActiveRatingId(rev.id)}>
                            Mark as Reviewed
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
              How it works
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              When you complete tasks on a specific day (e.g., Day 1), the system automatically schedules review sessions at optimized intervals (e.g., Day 2, Day 7, Day 14).
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Completing these daily reviews ensures you never forget the algorithms and concepts you learned weeks ago.
            </p>
          </Card>
          
          <Card className="p-5">
            <h3 className="text-md font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Upcoming Schedule
            </h3>
            <p className="text-sm text-slate-400">
              Future revisions are calculated dynamically based on your daily progress and mistake patterns. Keep progressing through your roadmap to unlock more!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Revision;
