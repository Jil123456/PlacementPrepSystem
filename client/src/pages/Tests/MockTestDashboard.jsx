import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Activity, Trophy, History, PlayCircle, BarChart3 } from 'lucide-react';
import testApi from '../../services/testApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const MockTestDashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await testApi.getHistory();
        if (response.success) {
          setHistory(response.data.tests || []);
        }
      } catch (error) {
        console.error("Failed to fetch test history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleStartTest = () => {
    navigate('/mock-test/take');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Timer className="text-primary-500 w-8 h-8" />
            Mock Tests
          </h1>
          <p className="text-slate-400 mt-2">
            Simulate real company assessments. 90 minutes, 29 questions across DSA, Aptitude, Core Subjects, and HR.
          </p>
        </div>
        <Button variant="primary" className="px-6 py-3 flex items-center gap-2 text-lg" onClick={handleStartTest}>
          <PlayCircle className="w-5 h-5" /> Start New Test
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-500/20 rounded-lg text-primary-500"><History className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-400">Tests Taken</p>
            <h3 className="text-2xl font-bold text-white">{history?.length || 0}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-500"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-400">Avg. Accuracy</p>
            <h3 className="text-2xl font-bold text-white">
              {history.length > 0 
                ? Math.round(history.reduce((acc, curr) => acc + parseFloat(curr.category_scores?.dsa?.accuracy || curr.overall_accuracy || 0), 0) / history.length) + '%'
                : 'N/A'}
            </h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg text-amber-500"><Trophy className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-400">Best Score</p>
            <h3 className="text-2xl font-bold text-white">
              {history.length > 0 
                ? Math.max(...history.map(t => t.correct_answers)) 
                : '0'} / 29
            </h3>
          </div>
        </Card>
      </div>

      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-slate-400" /> Test History
      </h2>

      <Card className="p-0 overflow-hidden border border-slate-800">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Timer className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300">No tests taken yet</h3>
            <p className="mt-2">Start your first mock test to see your performance analysis.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {history.map(test => (
              <div key={test.id} className="p-6 hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="primary" className="capitalize">{test.test_type} Test</Badge>
                    <span className="text-sm text-slate-500">{new Date(test.taken_at).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-6 mt-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Score</p>
                      <p className="text-lg font-bold text-emerald-400">{test.correct_answers} / {test.total_questions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Time Taken</p>
                      <p className="text-lg font-bold text-slate-300">{Math.floor(test.total_time_seconds / 60)}m {test.total_time_seconds % 60}s</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="default" className="text-xs">DSA: {test.category_scores?.dsa?.accuracy || 0}%</Badge>
                  <Badge variant="default" className="text-xs">Apt: {test.category_scores?.aptitude?.accuracy || 0}%</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
    </div>
  );
};

export default MockTestDashboard;
