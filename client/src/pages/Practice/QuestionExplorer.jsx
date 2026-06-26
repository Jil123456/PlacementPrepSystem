import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, BrainCircuit, Search, Filter, PlayCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const QuestionExplorer = ({ title, description, icon: Icon, fetchApi, type }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetchApi({ limit, page: currentPage });
        if (response.success) {
          setQuestions(response.data.questions);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [fetchApi, currentPage]);

  // Reset to page 1 if user types in search or changes filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, difficultyFilter]);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon className={`w-8 h-8 ${type === 'dsa' ? 'text-primary-500' : 'text-indigo-500'}`} />
            {title}
          </h1>
          <p className="text-slate-400 mt-2">{description}</p>
        </div>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search questions by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-slate-300 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No questions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {q.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{q.subcategory ? q.subcategory.replace('_', ' ') : 'General'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize font-medium ${q.difficulty === 'easy' ? 'text-emerald-400' : q.difficulty === 'medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* For now, we link to a generic solve page. If we want we can reuse /tasks/:id/solve, but that expects a task. We'll just link to a new QuestionSolve. */}
                      <Link to={`/questions/${q.id}/solve`} className="inline-flex items-center justify-center p-2 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 hover:scale-110 transition-all">
                        <PlayCircle className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="text-sm text-slate-400">
            Showing Page <span className="font-medium text-slate-200">{currentPage}</span> of <span className="font-medium text-slate-200">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuestionExplorer;
