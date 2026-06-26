import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import testApi from '../../services/testApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const TakeTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Test Data
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // User State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answerStr }
  const [visited, setVisited] = useState(new Set([0]));
  
  // Timer effect
  useEffect(() => {
    let timer;
    if (!loading && timeLeft > 0 && !submitting) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true); // auto submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, timeLeft, submitting]);

  // Fetch Test Data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await testApi.startTest();
        if (response.success) {
          setQuestions(response.data.questions);
          setTimeLeft(response.data.total_time_seconds);
        }
      } catch (error) {
        console.error("Failed to start test:", error);
        toast.error("Failed to load test");
        navigate('/mock-test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [navigate]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const confirmSubmit = window.confirm("Are you sure you want to submit the test? You cannot change answers after submitting.");
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    
    // Format answers for API
    const formattedAnswers = questions.map(q => ({
      question_id: q.id,
      answer: answers[q.id] || '',
      time_taken_seconds: 0 // Simplification for V1
    }));

    try {
      const response = await testApi.submitTest('new', formattedAnswers);
      if (response.success) {
        toast.success("Test Submitted Successfully!");
        setSubmitting(false);
        setIsSubmitted(true);
        setTimeout(() => navigate('/mock-test'), 4000);
      }
    } catch (error) {
      toast.error("Failed to submit test");
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (val) => {
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    setVisited(prev => new Set(prev).add(index));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-white font-medium">Generating your Mock Test...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-950 text-center animate-in fade-in zoom-in duration-500">
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <Send className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Test Complete!</h2>
        <p className="text-xl text-slate-300 max-w-lg mb-8">
          Outstanding effort! Your test has been successfully submitted and is being evaluated.
        </p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isMCQ = currentQ.category === 'aptitude' || currentQ.category === 'core_subject';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Badge variant="primary" className="text-sm px-3 py-1">Mock Test</Badge>
          <span className="text-slate-300 font-medium hidden sm:block">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>

        <Button variant="primary" onClick={() => handleSubmit(false)} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Test'} <Send className="w-4 h-4 ml-2 inline" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col space-y-4">
          <Card className="p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="default" className="capitalize">{currentQ.category.replace('_', ' ')}</Badge>
              <Badge variant={currentQ.difficulty === 'easy' ? 'success' : currentQ.difficulty === 'medium' ? 'warning' : 'danger'} className="capitalize">
                {currentQ.difficulty}
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-6">{currentIndex + 1}. {currentQ.title}</h2>
            
            <div className="prose prose-invert max-w-none mb-8 text-slate-300 whitespace-pre-wrap flex-1">
              {currentQ.description}
            </div>

            <div className="border-t border-slate-800 pt-6 mt-auto">
              {isMCQ && currentQ.options ? (
                <div className="space-y-3">
                  {Object.entries(currentQ.options).map(([key, value]) => (
                    <label key={key} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${answers[currentQ.id] === key ? 'bg-primary-900/30 border-primary-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                      <input type="radio" name={`q-${currentQ.id}`} value={key} checked={answers[currentQ.id] === key} onChange={(e) => handleAnswerChange(e.target.value)} className="w-4 h-4 text-primary-500 bg-slate-900 border-slate-700 focus:ring-primary-500" />
                      <span className="ml-3 text-slate-200"><strong className="text-slate-400 mr-2">{key.toUpperCase()}.</strong> {value}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Your Code / Solution</label>
                  <textarea 
                    value={answers[currentQ.id] || ''} 
                    onChange={(e) => handleAnswerChange(e.target.value)} 
                    placeholder="Write your solution here..." 
                    className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}
            </div>
          </Card>
          
          {/* Bottom Nav Controls */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => jumpToQuestion(currentIndex - 1)} disabled={currentIndex === 0}>
              <ChevronLeft className="w-5 h-5 mr-1" /> Previous
            </Button>
            <Button variant="outline" onClick={() => jumpToQuestion(currentIndex + 1)} disabled={currentIndex === questions.length - 1}>
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Sidebar Question Palette */}
        <Card className="w-full md:w-64 p-4 h-fit shrink-0">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Question Palette</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
              const isCurrent = currentIndex === idx;
              const isVis = visited.has(idx);

              let btnClass = 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'; // default unvisited
              if (isAnswered) btnClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
              else if (isVis) btnClass = 'bg-rose-500/20 border-rose-500/50 text-rose-400'; // visited but not answered

              if (isCurrent) btnClass += ' ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110';

              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`h-10 rounded font-medium text-sm transition-all border ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500/20 border border-rose-500/50 rounded"></div> Not Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-800 border border-slate-700 rounded"></div> Not Visited</div>
          </div>
        </Card>
        
      </div>
    </div>
  );
};

export default TakeTest;
