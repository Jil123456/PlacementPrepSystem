import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from '@monaco-editor/react';
import Confetti from 'react-confetti';
import { ChevronLeft, CheckCircle2, Clock, BrainCircuit, Code2, AlertTriangle, ExternalLink, BookOpen, Youtube, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import taskApi from '../../services/taskApi';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const SolveTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [answer, setAnswer] = useState('');
  const [startTime] = useState(Date.now());
  const [resultData, setResultData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isCompletedDay, setIsCompletedDay] = useState(false);

  // LeetCode Integration
  const [lcContent, setLcContent] = useState(null);
  const [lcLoading, setLcLoading] = useState(false);
  const [links, setLinks] = useState({ article: null, video: null, leetcode: null, isParsed: false });

  // Timer Effect
  useEffect(() => {
    if (task?.type === 'dsa' && !task.is_completed && !resultData) {
      setTimeLeft(45 * 60); // 45 minutes
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [task, resultData]);

  const handleTimeout = async () => {
    toast.error("Time's up! Marking as incomplete.");
    await submitToServer("(Time expired)");
  };

  useEffect(() => {
    // Reset all form states when the task ID changes
    setAnswer('');
    setResultData(null);
    setSubmitting(false);
    setIsCompletedDay(false);
    setLcContent(null);
    setTask(null);
    setLinks({ article: null, video: null, leetcode: null, isParsed: false });
    
    const fetchTask = async () => {
      setLoading(true);
      try {
        const response = await taskApi.getTaskDetails(id); 
        if (response.success && response.data.task) {
          const currentTask = response.data.task;
          setTask(currentTask);
          
          try {
            const dayNum = currentTask.roadmapDay?.day_number;
            if (dayNum) {
              const dayResponse = await taskApi.getDayTasks(dayNum);
              if (dayResponse.success && dayResponse.data.tasks) {
                setAllTasks(dayResponse.data.tasks);
              } else {
                setAllTasks([currentTask]); 
              }
            } else {
              setAllTasks([currentTask]);
            }
          } catch(err) {
            setAllTasks([currentTask]);
          }
        } else {
          toast.error("Task not found.");
          navigate('/tasks');
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error);
        toast.error("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  // Parse links and fetch LeetCode content
  useEffect(() => {
    if (task?.question?.description && !links.isParsed) {
      const desc = task.question.description;
      const articleMatch = desc.match(/Article:\s*(http[s]?:\/\/[^\s]+)/);
      const videoMatch = desc.match(/Video:\s*(http[s]?:\/\/[^\s]+)/);
      const lcMatch = desc.match(/LeetCode:\s*(http[s]?:\/\/leetcode\.com\/problems\/([^/\s]+))/);

      const parsedLinks = {
        article: articleMatch && articleMatch[1] !== '$undefined' ? articleMatch[1] : null,
        video: videoMatch && videoMatch[1] !== '$undefined' ? videoMatch[1] : null,
        leetcode: lcMatch && lcMatch[1] !== '$undefined' ? lcMatch[1] : null,
        isParsed: true
      };
      setLinks(parsedLinks);

      if (lcMatch && lcMatch[2] && lcMatch[2] !== '$undefined') {
        setLcLoading(true);
        taskApi.fetchLeetcodeContent(lcMatch[2])
          .then(res => {
            if (res.success && res.data?.content) setLcContent(res.data.content);
          })
          .catch(e => console.error("Failed to load LC content", e))
          .finally(() => setLcLoading(false));
      }
    }
  }, [task, links.isParsed]);

  const submitToServer = async (submitAnswer) => {
    setSubmitting(true);
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await taskApi.submitTask(id, submitAnswer, timeTakenSeconds);
      setResultData(response.data);
      
      if (response.data?.is_correct) {
        toast.success('Correct! Well done!', { icon: '🎉', duration: 4000 });
      } else {
        toast.error('Needs Improvement. Review the explanation.', { icon: '🤖' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() && task?.question?.category !== 'dsa') {
      toast.error('Please provide an answer.');
      return;
    }
    const submitAnswer = answer.trim() || 'completed';
    await submitToServer(submitAnswer);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isCompletedDay) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-center animate-in fade-in zoom-in duration-500">
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
        <div className="bg-slate-900/80 border border-slate-700 p-10 rounded-2xl max-w-lg mx-auto shadow-2xl backdrop-blur-sm">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Day Completed!</h1>
          <p className="text-lg text-slate-300 mb-8">
            You've successfully finished all tasks for today. Consistency is the key to success. Keep it up!
          </p>
          <Button onClick={() => navigate('/tasks')} variant="primary" className="px-8 py-3 text-lg">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const { question } = task;
  const isMCQ = question.category === 'aptitude' || question.category === 'core_subject';

  let parsedOptions = null;
  if (isMCQ && question.options) {
    try {
      parsedOptions = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
    } catch (e) {
      console.error("Failed to parse options", e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Back Navigation */}
      <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      {/* Question Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'danger'} className="capitalize">
                {question.difficulty}
              </Badge>
              <Badge variant="default" className="capitalize">
                {question.category.replace('_', ' ')}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-white">{question.title}</h1>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <Clock className={`w-4 h-4 ${timeLeft !== null && timeLeft < 300 ? 'text-rose-500 animate-pulse' : ''}`} />
            <span className={`text-sm font-medium ${timeLeft !== null && timeLeft < 300 ? 'text-rose-500' : ''}`}>
              {timeLeft !== null 
                ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` 
                : `${Math.floor(question.time_limit_seconds / 60)} min limit`}
            </span>
          </div>
        </div>

        {/* Links and Actions - Always show for DSA questions */}
        {question.category === 'dsa' && (
          <div className="flex flex-wrap gap-3 mb-6">
            <a href={links.leetcode || `https://leetcode.com/problemset/?search=${encodeURIComponent(question.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Code2 className="w-4 h-4" /> Solve on LeetCode
            </a>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(question.title + ' leetcode solution')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <BookOpen className="w-4 h-4" /> Read Article
            </a>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(question.title + ' leetcode solution')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Youtube className="w-4 h-4" /> Watch Video
            </a>
          </div>
        )}

        {/* Question Description */}
        <div className="mb-8">
          {lcLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 text-sm">Fetching exact problem description from LeetCode...</p>
            </div>
          ) : lcContent ? (
            <div className="prose prose-invert max-w-none bg-slate-900/80 p-6 rounded-xl border border-slate-800 leetcode-content" dangerouslySetInnerHTML={{ __html: lcContent }}>
            </div>
          ) : question.description ? (
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        children={String(children).replace(/\n$/, '')}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                      />
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {links.isParsed ? question.description.replace(/Article:.*\n|Video:.*\n|LeetCode:.*/g, '').trim() : question.description}
              </ReactMarkdown>
              
              {!lcContent && !lcLoading && links.leetcode && (
                <div className="mt-8 flex flex-col items-center p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                  <AlertTriangle className="w-8 h-8 text-rose-400 mb-3" />
                  <h3 className="text-lg font-medium text-white mb-2">Is this a Premium Question?</h3>
                  <p className="text-slate-400 text-sm mb-4 max-w-md">
                    We couldn't fetch the full problem description. If this question requires LeetCode Premium or the link is broken, you can instantly swap it out for a different question of the exact same difficulty and topic.
                  </p>
                  <Button 
                    variant="primary" 
                    className="bg-rose-600 hover:bg-rose-500 text-white"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const res = await taskApi.replaceTask(id);
                        if (res.success) {
                          setTask(res.data.task);
                          toast.success('Question replaced successfully!');
                        }
                      } catch(err) {
                        toast.error(err.response?.data?.message || 'Failed to replace question');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Swap with another question
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 italic">No detailed description provided for this task.</p>
          )}
        </div>

        {/* Options / Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-slate-800 pt-6">
          
          {isMCQ && parsedOptions ? (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select your answer:</h3>
              {Array.isArray(parsedOptions) ? parsedOptions.map((opt, index) => {
                const key = opt.value || opt.label || String(index);
                const labelStr = opt.label ? `${opt.label}.` : '';
                return (
                  <label 
                    key={key} 
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                      answer === key 
                        ? 'bg-primary-900/30 border-primary-500' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={key}
                      checked={answer === key}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-4 h-4 text-primary-500 bg-slate-900 border-slate-700 focus:ring-primary-500 focus:ring-offset-slate-900"
                    />
                    <span className="ml-3 text-slate-200">
                      {labelStr && <strong className="text-slate-400 mr-2">{labelStr}</strong>} 
                      {opt.text || opt.value || JSON.stringify(opt)}
                    </span>
                  </label>
                );
              }) : Object.entries(parsedOptions).map(([key, value]) => (
                <label 
                  key={key} 
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    answer === key 
                      ? 'bg-primary-900/30 border-primary-500' 
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={key}
                    checked={answer === key}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-4 h-4 text-primary-500 bg-slate-900 border-slate-700 focus:ring-primary-500 focus:ring-offset-slate-900"
                  />
                  <span className="ml-3 text-slate-200">
                    <strong className="text-slate-400 mr-2">{key.toUpperCase()}.</strong> {String(value)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {question.category === 'dsa' ? <Code2 className="w-5 h-5 text-primary-400" /> : <BrainCircuit className="w-5 h-5 text-indigo-400" />}
                {question.category === 'dsa' ? 'Write Your Code' : 'Your Solution / Notes'}
              </h3>
              {question.category === 'dsa' ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm text-slate-400">Language:</label>
                    <select 
                      value={codeLanguage} 
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="c">C</option>
                    </select>
                  </div>
                  <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={`// Write your ${codeLanguage} solution here...\n\nfunction solve() {\n  \n}`}
                      className="w-full h-[350px] bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
                      spellCheck="false"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400 mb-2">
                    Write down your key takeaways or understanding of this concept.
                  </p>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write your notes here..."
                    className="w-full h-48 bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 custom-scrollbar resize-none"
                  ></textarea>
                </>
              )}
            </div>
          )}
          {resultData && (
            <div className={`mt-6 p-6 rounded-lg border ${resultData.is_correct ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-rose-900/20 border-rose-500/30'}`}>
              <div className="flex items-start gap-3">
                {resultData.is_correct ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-rose-400" />}
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${resultData.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {resultData.is_correct ? 'AI Evaluation: Pass' : 'AI Evaluation: Needs Improvement'}
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-4">{resultData.feedback}</p>
                  
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                    {resultData.correct_answer && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Ideal Answer / Concept</p>
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">{resultData.correct_answer}</p>
                      </div>
                    )}
                    {resultData.explanation && resultData.explanation !== resultData.correct_answer && (
                      <div className={resultData.correct_answer ? "pt-3 border-t border-slate-800" : ""}>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Explanation</p>
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">{resultData.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            {resultData ? (
                <Button onClick={() => {
                  const currentIndex = allTasks.findIndex(t => t.id === parseInt(id));
                  const nextTask = allTasks.slice(currentIndex + 1).find(t => !t.is_completed);
                  if (nextTask) {
                    navigate(`/tasks/${nextTask.id}/solve`);
                  } else {
                    setIsCompletedDay(true);
                  }
                }} variant="primary" className="px-8">
                  {(() => {
                    const currentIndex = allTasks.findIndex(t => t.id === parseInt(id));
                    const nextTask = allTasks.slice(currentIndex + 1).find(t => !t.is_completed);
                    return nextTask ? 'Continue to Next Task' : 'Finish Daily Task';
                  })()}
                </Button>
            ) : (
                <Button 
                type="submit" 
                variant="primary" 
                className="px-8"
                disabled={submitting || task.is_completed}
                >
                {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : task.is_completed ? (
                    <>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Already Completed
                    </>
                ) : (
                    'Submit Answer'
                )}
                </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SolveTask;
