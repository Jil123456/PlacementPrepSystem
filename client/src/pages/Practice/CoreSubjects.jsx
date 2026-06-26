import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Search, Filter, PlayCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import questionApi from '../../services/questionApi';

const CoreSubjects = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await questionApi.getCoreSubjectQuestions({ 
            limit, 
            page: currentPage,
            subcategory: subjectFilter !== 'all' ? subjectFilter : undefined
        });
        if (response.success) {
          setQuestions(response.data.questions);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch core subject questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [currentPage, subjectFilter]);

  // Reset to page 1 if user types in search or changes filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, subjectFilter]);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getSubjectName = (sub) => {
    switch(sub) {
        case 'cn': return 'Computer Networks';
        case 'dbms': return 'DBMS';
        case 'os': return 'Operating Systems';
        default: return sub;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-cyan-500" />
            Core CS Subjects
          </h1>
          <p className="text-slate-400 mt-2">Master OS, DBMS, and Computer Networks concepts frequently asked in interviews.</p>
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
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Subjects</option>
            <option value="os">Operating Systems</option>
            <option value="dbms">DBMS</option>
            <option value="cn">Computer Networks</option>
          </select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-slate-300 uppercase font-medium">
              <tr>
                <th className="px-6 py-4 w-1/2">Title</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-cyan-400 border border-cyan-400/20">
                        {getSubjectName(q.subcategory)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/questions/${q.id}/solve`} className="inline-flex items-center justify-center p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:scale-110 transition-all">
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

export default CoreSubjects;
