import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import { 
  Flame, 
  Target, 
  BrainCircuit, 
  Trophy, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Building
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import taskApi from '../../services/taskApi';
import progressApi from '../../services/progressApi';
import mistakesApi from '../../services/mistakesApi';
import { calculateCompanyReadiness } from '../../utils/readiness';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [weaknessData, setWeaknessData] = useState(null);
  const [pendingMistakes, setPendingMistakes] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchTasksAndDashboard = async () => {
      try {
        const [taskRes, dashRes, weakRes, mistakesRes] = await Promise.all([
          taskApi.getTodayTasks(),
          progressApi.getDashboard(),
          progressApi.getWeakness(),
          mistakesApi.getPendingMistakes()
        ]);
        if (taskRes.success) {
          setTasks(taskRes.data.tasks || []);
        }
        if (dashRes.success) {
          setDashboardData(dashRes.data);
          if (dashRes.data.user?.current_day && dashRes.data.user.current_day !== user.current_day) {
            setUser(prev => ({ ...prev, current_day: dashRes.data.user.current_day }));
          }
        }
        if (weakRes.success) {
          setWeaknessData(weakRes.data);
        }
        if (mistakesRes && mistakesRes.success) {
          setPendingMistakes(mistakesRes.data.mistakes || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoadingTasks(false);
      }
    };
    if (user?.id) {
      fetchTasksAndDashboard();
    }
  }, [user?.id]);

  // Calculate Daily Progress
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const dailyProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 18) greeting = 'Good Afternoon';

  // Calculate Weak Areas
  const mistakeCountsByTopic = pendingMistakes.reduce((acc, mistake) => {
    const topic = mistake.question?.subcategory || mistake.question?.category || 'Unknown';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});
  const criticalWeakAreas = Object.entries(mistakeCountsByTopic).filter(([_, count]) => count > 5).map(([topic]) => topic);

  // Rotating Quotes
  const quotes = [
    '"The future depends on what you do today." - Mahatma Gandhi',
    '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
    '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
    '"It always seems impossible until it\'s done." - Nelson Mandela',
    '"The only way to do great work is to love what you do." - Steve Jobs',
    '"Don\'t watch the clock; do what it does. Keep going." - Sam Levenson',
    '"Opportunities don\'t happen, you create them." - Chris Grosser'
  ];
  const quote = quotes[(user?.current_day || 1) % quotes.length];

  // Readiness Score
  const readinessScore = dashboardData?.readiness?.readiness_score || user?.initial_assessment_scores?.overall || 0;

  // Streak Message
  let streakMessage = "Keep building your habit!";
  const currentStreak = user?.streak || 0;
  if (currentStreak >= 30) streakMessage = "Unstoppable! 🚀";
  else if (currentStreak >= 7) streakMessage = "One week strong! 🔥";
  else if (currentStreak >= 3) streakMessage = "You're on fire! 🔥";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {greeting}, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-slate-400 mt-2 italic">
            {quote}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="px-3 py-1.5 text-sm">
            <Target className="w-4 h-4 mr-2 inline" />
            Product Mode
          </Badge>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingTasks ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-5 flex flex-col justify-between animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-full">
                    <div className="h-3 bg-slate-700 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-slate-700 rounded w-1/3 mt-1"></div>
                  </div>
                  <div className="w-10 h-10 bg-slate-700 rounded-lg shrink-0"></div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full w-full mb-3 mt-4"></div>
                <div className="h-2 bg-slate-700 rounded w-2/3"></div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-5 flex flex-col justify-between group hover:border-primary-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">Daily Progress</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{dailyProgress}%</h3>
                </div>
                <div className="p-2 bg-primary-900/30 rounded-lg text-primary-400 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <ProgressBar value={dailyProgress} max={100} showValue={false} />
              <p className="text-xs text-slate-400 mt-3">{completedTasks} of {totalTasks} tasks completed today</p>
            </Card>

            <Card className="p-5 flex flex-col justify-between group hover:border-orange-500/50 transition-colors relative overflow-hidden">
              {currentStreak >= 3 && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
              )}
              <div className="flex justify-between items-start mb-4 relative">
                <div>
                  <p className="text-sm font-medium text-slate-400">Current Streak</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{currentStreak} <span className="text-sm font-normal text-slate-500">days</span></h3>
                </div>
                <div className={`p-2 rounded-lg text-orange-400 group-hover:scale-110 transition-transform ${currentStreak >= 3 ? 'bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-orange-900/30'}`}>
                  <Flame className={`w-6 h-6 ${currentStreak >= 3 ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              <div className="relative mt-2">
                <p className={`text-sm font-medium ${currentStreak >= 3 ? 'text-orange-400' : 'text-slate-300'}`}>
                  {streakMessage}
                </p>
                <p className="text-xs text-slate-400 flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" /> Best streak: {user?.max_streak || 0}
                </p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between group hover:border-emerald-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">Experience Points</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{user?.level?.xp_points?.toLocaleString() || 0} <span className="text-sm font-normal text-slate-500">XP</span></h3>
                </div>
                <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
              <ProgressBar value={user?.level?.xp_points || 0} max={2000} label="To next level" color="success" />
            </Card>

            <Card className="p-5 flex flex-col justify-between group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">Readiness Score</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {readinessScore}%
                  </h3>
                </div>
                <div className="p-2 bg-indigo-900/30 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-6 h-6" />
                </div>
              </div>
              <ProgressBar value={readinessScore} max={100} showValue={false} color="primary" />
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks Summary */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Today's Tasks <span className="text-slate-400 font-normal text-base ml-2">Day {dashboardData?.user?.current_day || user?.current_day || 1}</span></h2>
            <Badge variant="warning">In Progress</Badge>
          </div>
          
          <div className="space-y-4">
            {loadingTasks ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-slate-400 p-4 text-center">No tasks available for today. Great job!</p>
            ) : (
              <div className="space-y-6">
                {['dsa_revision', 'dsa', 'core_subject', 'hr', 'mock_test'].map((taskType) => {
                  const groupedTasks = tasks.filter(t => t.type === taskType);
                  if (groupedTasks.length === 0) return null;

                  let groupTitle = '';
                  let groupIcon = '📝';
                  if (taskType === 'dsa_revision') { groupTitle = '🧠 DSA - REVISION (Priority)'; groupIcon = '🧠'; }
                  if (taskType === 'dsa') { groupTitle = '💡 DSA - NEW'; groupIcon = '💡'; }
                  if (taskType === 'core_subject') { groupTitle = '📘 Core Subject'; groupIcon = '📘'; }
                  if (taskType === 'hr') { groupTitle = '🎤 HR Question'; groupIcon = '🎤'; }
                  if (taskType === 'mock_test') { groupTitle = '🏆 Mock Test'; groupIcon = '🏆'; }

                  return (
                    <div key={taskType} className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">{groupTitle}</h3>
                      {groupedTasks.map((task) => (
                        <Link 
                          to={`/tasks/${task.id}/solve`} 
                          key={task.id} 
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 transition-colors group cursor-pointer block"
                        >
                          <div className="flex items-center gap-4">
                            {task.is_completed ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-slate-600 group-hover:border-primary-500 transition-colors"></div>
                            )}
                            <div>
                              <h4 className={`font-medium ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                {task.title || 'Unknown Task'}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                            </div>
                          </div>
                          <div className="text-slate-500 group-hover:text-primary-400 transition-colors">
                            <Clock className="w-5 h-5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Weak Areas Alert */}
          {criticalWeakAreas.length > 0 ? (
            <Card variant="danger" className="p-5 border-rose-500/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-rose-200">Weakness Detected</h3>
                  <p className="text-sm text-rose-300/90 mt-1 mb-2">
                    You have &gt; 5 pending mistakes in: <span className="font-bold text-rose-100">{criticalWeakAreas.join(', ')}</span>
                  </p>
                  <p className="text-xs text-rose-300/70 mb-3">
                    Recommendation: Review your Improvement Queue.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-5 bg-emerald-900/10 border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-200">On Track</h3>
                  <p className="text-sm text-emerald-300/80 mt-1">No critical weaknesses detected yet. Keep up the good accuracy!</p>
                </div>
              </div>
            </Card>
          )}

          {/* Improvement Queue */}
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <Target className="w-4 h-4 mr-2 text-primary-400" />
              Improvement Queue
            </h3>
            <div className="space-y-3">
              {pendingMistakes.length === 0 ? (
                <div className="text-sm text-slate-400 text-center w-full">No pending mistakes to improve!</div>
              ) : (
                pendingMistakes.slice(0, 3).map(mistake => (
                  <Link 
                    to={`/practice/question/${mistake.question_id}`}
                    key={mistake.id}
                    className="flex justify-between items-center p-3 rounded bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200 line-clamp-1">{mistake.question?.title}</p>
                      <p className="text-xs text-rose-400 mt-1">Attempts: {mistake.attempt_count}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming Revisions */}
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-primary-400" />
              Upcoming Revisions
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 text-center w-full">No upcoming revisions scheduled.</span>
              </div>
            </div>
          </Card>

          {/* Target Companies */}
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <Building className="w-4 h-4 mr-2 text-emerald-400" />
              Target Companies
            </h3>
            <div className="space-y-4">
              {calculateCompanyReadiness(user).slice(0, 3).map(company => (
                <div key={company.name} className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">{company.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${company.score >= 70 ? 'bg-emerald-500' : company.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${company.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400">{company.score}%</span>
                  </div>
                </div>
              ))}
              {calculateCompanyReadiness(user).length > 3 && (
                <Link to="/analytics" className="text-xs text-primary-400 hover:text-primary-300 text-center block mt-2">
                  View All Companies
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
