import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Clock, BrainCircuit, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import questionApi from '../../services/questionApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const SolveQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [answer, setAnswer] = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await questionApi.getQuestionById(id);
        if (response.success) {
          setQuestion(response.data);
        } else {
          toast.error("Question not found.");
          navigate(-1);
        }
      } catch (error) {
        console.error("Failed to fetch question:", error);
        toast.error("Failed to load question details");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() && question?.category !== 'dsa') {
      toast.error('Please provide an answer.');
      return;
    }

    setSubmitting(true);
    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const submitAnswer = answer.trim() || 'completed';
      const response = await questionApi.submitAnswer(id, submitAnswer, timeTakenSeconds);
      
      if (response.data?.is_correct || response.success) {
        setIsCompleted(true);
        toast.success(`Correct!`, { icon: '✅' });
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error('Incorrect answer. Keep trying!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!question) return null;

  const isMCQ = question.category === 'aptitude' || question.category === 'core_subject';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Practice
      </button>

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
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{Math.floor(question.time_limit_seconds / 60)} min limit</span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-8">
          {question.description ? (
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {question.description}
            </div>
          ) : (
            <p className="text-slate-400 italic">No detailed description provided.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-800 pt-6">
          {isMCQ && question.options ? (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select your answer:</h3>
              {Object.entries(question.options).map(([key, value]) => (
                <label key={key} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${answer === key ? 'bg-primary-900/30 border-primary-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}>
                  <input type="radio" name="answer" value={key} checked={answer === key} onChange={(e) => setAnswer(e.target.value)} className="w-4 h-4 text-primary-500 bg-slate-900 border-slate-700 focus:ring-primary-500" />
                  <span className="ml-3 text-slate-200"><strong className="text-slate-400 mr-2">{key.toUpperCase()}.</strong> {value}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {question.category === 'dsa' ? <Code2 className="w-5 h-5 text-primary-400" /> : <BrainCircuit className="w-5 h-5 text-indigo-400" />}
                Your Solution / Notes
              </h3>
              <p className="text-sm text-slate-400 mb-2">
                {question.category === 'dsa' ? "Solve this on LeetCode/GFG and paste your code snippet here." : "Write your key takeaways."}
              </p>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Paste code or notes here..." className="w-full h-48 bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 custom-scrollbar resize-none"></textarea>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="submit" variant="primary" className="px-8" disabled={submitting || isCompleted}>
              {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : isCompleted ? <><CheckCircle2 className="w-5 h-5 mr-2" /> Done</> : 'Submit Answer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SolveQuestion;
