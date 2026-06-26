import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, CheckCircle2, CalendarDays, ChevronDown, ChevronUp, PlayCircle, Code2 } from 'lucide-react';
import progressApi from '../../services/progressApi';
import taskApi from '../../services/taskApi';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const TasksList = () => {
  const { user, setUser } = useAuth();
  const [roadmapDays, setRoadmapDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [dayTasks, setDayTasks] = useState({});
  const [loadingDayTasks, setLoadingDayTasks] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await progressApi.getRoadmap();
        if (response.success) {
          setRoadmapDays(response.data.roadmap);
          if (response.data.current_day && response.data.current_day !== user.current_day) {
            setUser(prev => ({ ...prev, current_day: response.data.current_day }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch roadmap:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const handleExpandDay = async (dayNumber) => {
    if (expandedDay === dayNumber) {
      setExpandedDay(null);
      return;
    }
    
    setExpandedDay(dayNumber);
    
    if (!dayTasks[dayNumber]) {
      setLoadingDayTasks(true);
      try {
        const response = await taskApi.getDayTasks(dayNumber);
        if (response.success) {
          setDayTasks(prev => ({
            ...prev,
            [dayNumber]: response.data.tasks
          }));
          if (response.data.progress) {
            setRoadmapDays(prev => prev.map(d => 
              d.day_number === dayNumber 
                ? { 
                    ...d, 
                    is_completed: response.data.progress.is_completed,
                    tasks_completed: response.data.progress.tasks_completed,
                    total_tasks: response.data.progress.total_tasks
                  } 
                : d
            ));
          }
        }
      } catch (error) {
        console.error(`Failed to fetch tasks for day ${dayNumber}:`, error);
      } finally {
        setLoadingDayTasks(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="text-primary-500" />
            60-Day Roadmap
          </h1>
          <p className="text-slate-400 mt-2">Follow the structured path. You cannot skip ahead.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-slate-400">Current Progress</p>
          <p className="text-xl font-bold text-white">Day {user.current_day} / 60</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {roadmapDays.map((day) => {
          const isLocked = day.day_number > user.current_day;
          const isCurrentDay = day.day_number === user.current_day;
          const isCompleted = day.is_completed;
          const isExpanded = expandedDay === day.day_number;

          return (
            <Card 
              key={day.id} 
              className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${isCurrentDay ? 'border-primary-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : ''}`}
            >
              <div 
                className={`p-5 cursor-pointer flex-1 flex flex-col justify-between ${isLocked ? 'opacity-50 hover:opacity-70' : 'hover:bg-slate-800/50'}`}
                onClick={() => !isLocked && handleExpandDay(day.day_number)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Day {day.day_number}</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">{day.focus_area ? day.focus_area.replace('_', ' ') : ''}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/50 text-slate-400">
                    {isLocked ? <Lock className="w-5 h-5" /> : isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Unlock className="w-5 h-5 text-primary-400" />}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{day.total_tasks > 0 ? `${Math.round((day.tasks_completed / day.total_tasks) * 100)}%` : '0%'}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-primary-500'}`} style={{ width: day.total_tasks > 0 ? `${(day.tasks_completed / day.total_tasks) * 100}%` : '0%' }}></div>
                  </div>
                </div>
                
                {!isLocked && (
                  <div className="mt-4 flex justify-center text-slate-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                )}
              </div>

              {/* Expanded Tasks View */}
              {isExpanded && !isLocked && (
                <div className="bg-slate-900/50 border-t border-slate-800 p-4">
                  {loadingDayTasks ? (
                    <div className="flex justify-center p-4">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : dayTasks[day.day_number] ? (
                    <div className="space-y-3">
                      {dayTasks[day.day_number].map(task => {
                        const lcMatch = task.question?.description?.match(/LeetCode:\s*(http[s]?:\/\/leetcode\.com\/problems\/([^/\s]+))/);
                        const leetcodeLink = lcMatch ? lcMatch[1] : null;

                        return (
                          <div key={task.id} className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-3 overflow-hidden">
                              {task.is_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex-shrink-0"></div>}
                              {leetcodeLink ? (
                                <a href={leetcodeLink} target="_blank" rel="noopener noreferrer" className={`text-sm truncate hover:underline ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                  {task.question?.title}
                                </a>
                              ) : (
                                <span className={`text-sm truncate ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                  {task.question?.title}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 ml-2 shrink-0">
                              {leetcodeLink && (
                                <a href={leetcodeLink} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400" title="Open in LeetCode">
                                  <Code2 className="w-4 h-4" />
                                </a>
                              )}
                              {!task.is_completed && (
                                <Link to={`/tasks/${task.id}/solve`} className="text-primary-400 hover:text-primary-300" title="Submit Answer">
                                  <PlayCircle className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-slate-400 py-2">No tasks found.</p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TasksList;
