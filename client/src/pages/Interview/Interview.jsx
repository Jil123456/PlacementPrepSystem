import React from 'react';
import { Users, Presentation, MessageSquare, Video, Mic, Briefcase } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const Interview = () => {
  const commonQuestions = [
    { category: "Introduction", q: "Tell me about yourself.", hints: ["Keep it under 2 mins", "Focus on academic & project highlights", "Connect to the role"] },
    { category: "Strengths & Weaknesses", q: "What are your greatest strengths and weaknesses?", hints: ["Be honest but strategic", "Show how you are working on your weakness"] },
    { category: "Behavioral", q: "Describe a time you faced a conflict in a team project.", hints: ["Use STAR method (Situation, Task, Action, Result)"] },
    { category: "Career Goals", q: "Where do you see yourself in 5 years?", hints: ["Align with the company's trajectory", "Show ambition and willingness to learn"] },
    { category: "Company Fit", q: "Why do you want to join our company?", hints: ["Research the company beforehand", "Mention specific products or culture"] }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-fuchsia-500 w-8 h-8" />
            HR Interview Preparation
          </h1>
          <p className="text-slate-400 mt-2">
            Master the behavioral and HR rounds. Communication is just as important as code.
          </p>
        </div>
        <Badge variant="primary" className="text-sm px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50">
          Beta Feature
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 flex flex-col items-center text-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer border-t-4 border-t-fuchsia-500">
          <div className="p-4 bg-fuchsia-500/10 rounded-full text-fuchsia-500"><Mic className="w-8 h-8" /></div>
          <h3 className="text-lg font-bold text-white">Mock AI Interview</h3>
          <p className="text-sm text-slate-400">Practice speaking your answers aloud and get AI feedback. (Coming soon)</p>
        </Card>
        
        <Card className="p-5 flex flex-col items-center text-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer border-t-4 border-t-sky-500">
          <div className="p-4 bg-sky-500/10 rounded-full text-sky-500"><Briefcase className="w-8 h-8" /></div>
          <h3 className="text-lg font-bold text-white">Resume Review</h3>
          <p className="text-sm text-slate-400">Upload your resume for ATS scoring and keyword optimization. (Coming soon)</p>
        </Card>

        <Card className="p-5 flex flex-col items-center text-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer border-t-4 border-t-emerald-500">
          <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500"><Presentation className="w-8 h-8" /></div>
          <h3 className="text-lg font-bold text-white">Group Discussion</h3>
          <p className="text-sm text-slate-400">Key frameworks and common topics for GD rounds.</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
        <MessageSquare className="w-6 h-6 text-slate-400" /> Top 5 Must-Know HR Questions
      </h2>

      <div className="space-y-4">
        {commonQuestions.map((item, idx) => (
          <Card key={idx} className="p-6 border-l-4 border-l-fuchsia-500">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Badge variant="default" className="mb-2">{item.category}</Badge>
                <h3 className="text-xl font-semibold text-white mb-3">"{item.q}"</h3>
                <div className="flex flex-wrap gap-2">
                  {item.hints.map((hint, i) => (
                    <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">💡 {hint}</span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-64">
                <textarea 
                  placeholder="Draft your bullet points here..." 
                  className="w-full h-full min-h-[100px] bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-fuchsia-500"
                ></textarea>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
    </div>
  );
};

export default Interview;
