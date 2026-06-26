import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ChevronRight, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Onboarding = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    college: '',
    branch: '',
    graduation_year: new Date().getFullYear(),
    cgpa: '',
    preferred_companies: [],
    dsa_level: 'Beginner',
    daily_study_time: 2,
    answers: {}
  });

  useEffect(() => {
    // Assessment removed to speed up onboarding
  }, []);

  const handleCompanyToggle = (company) => {
    setFormData(prev => ({
      ...prev,
      preferred_companies: prev.preferred_companies.includes(company)
        ? prev.preferred_companies.filter(c => c !== company)
        : [...prev.preferred_companies, company]
    }));
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      const res = await api.post('/onboarding/complete', formData);
      toast.success('Onboarding complete! Roadmap generated.');
      setUser({ ...user, onboarding_completed: true, initial_assessment_scores: res.data.data.scores, preferred_companies: formData.preferred_companies });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete onboarding');
      setLoading(false);
    }
  };

  const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'];

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold">Let's get to know you!</h2>
            <p className="text-slate-400">Basic information to personalize your profile.</p>
            <input type="text" placeholder="College Name" className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
            <input type="text" placeholder="Branch / Major" className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
            <div className="flex gap-4">
              <input type="number" placeholder="Graduation Year" className="w-1/2 p-3 bg-slate-800 rounded-lg border border-slate-700" value={formData.graduation_year} onChange={e => setFormData({...formData, graduation_year: e.target.value})} />
              <input type="number" step="0.1" placeholder="CGPA" className="w-1/2 p-3 bg-slate-800 rounded-lg border border-slate-700" value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: e.target.value})} />
            </div>
            <button onClick={() => setStep(2)} className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-bold flex justify-center items-center">Next <ChevronRight className="ml-2" /></button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold">Preferred Companies</h2>
            <p className="text-slate-400">Select the companies you are targeting.</p>
            <div className="grid grid-cols-2 gap-3">
              {companies.map(c => (
                <button key={c} onClick={() => handleCompanyToggle(c)} className={`p-3 rounded-lg border ${formData.preferred_companies.includes(c) ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-bold flex justify-center items-center">Next <ChevronRight className="ml-2" /></button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold">Current DSA Level</h2>
            <div className="space-y-3">
              {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button key={lvl} onClick={() => setFormData({...formData, dsa_level: lvl})} className={`w-full p-4 text-left rounded-lg border ${formData.dsa_level === lvl ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-slate-800 border-slate-700'}`}>
                  {lvl}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(4)} className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-bold flex justify-center items-center">Next <ChevronRight className="ml-2" /></button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold">Daily Study Time</h2>
            <div className="space-y-3">
              {[2, 4, 6].map(hrs => (
                <button key={hrs} onClick={() => setFormData({...formData, daily_study_time: hrs})} className={`w-full p-4 text-left rounded-lg border ${formData.daily_study_time === hrs ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-slate-800 border-slate-700'}`}>
                  {hrs} Hours
                </button>
              ))}
            </div>
            <button onClick={submitOnboarding} disabled={loading} className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-bold flex justify-center items-center">
              {loading ? <Loader className="animate-spin mr-2" /> : 'Generate Roadmap'} 
              {!loading && <ChevronRight className="ml-2" />}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;
