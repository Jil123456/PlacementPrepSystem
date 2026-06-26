import React from 'react';
import Card from '../../components/common/Card';
import Heatmap from '../../components/Heatmap';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Activity, BrainCircuit, Building, AlertCircle } from 'lucide-react';
import { calculateCompanyReadiness } from '../../utils/readiness';

const Analytics = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Track your performance and progress.</p>
        </div>
      </div>

      <Heatmap />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary-400" />
            Performance by Category
          </h3>
          <p className="text-slate-400 text-sm">Keep practicing to generate detailed category insights.</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-indigo-400" />
            Weak Areas
          </h3>
          <p className="text-slate-400 text-sm">No weak areas identified yet. Great job!</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center">
          <Building className="w-5 h-5 mr-2 text-emerald-400" />
          Target Companies Readiness
        </h3>
        <p className="text-xs text-slate-400 flex items-center mb-6">
          <AlertCircle className="w-3 h-3 mr-1 text-amber-400" />
          This is an estimate based on your platform performance, not a guarantee of placement success.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculateCompanyReadiness(user).length === 0 ? (
            <p className="text-slate-400 text-sm">No target companies selected during onboarding.</p>
          ) : (
            calculateCompanyReadiness(user).map(company => (
              <div key={company.name} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-white">{company.name}</h4>
                  <span className={`text-sm font-bold ${company.score >= 70 ? 'text-emerald-400' : company.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {company.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${company.score >= 70 ? 'bg-emerald-500' : company.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                    style={{ width: `${company.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {company.isProduct ? 'Product-based Focus (Heavy DSA)' : 'Service-based Focus (Heavy Aptitude)'}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
