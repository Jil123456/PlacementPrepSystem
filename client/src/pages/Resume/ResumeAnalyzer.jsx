import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resume/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        toast.success('Resume analyzed successfully!');
      } else {
        toast.error(data.message || 'Failed to analyze resume.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Network error during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (score >= 60) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    return 'text-red-400 border-red-500/50 bg-red-500/10';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Resume ATS Scorer</h1>
          <p className="text-slate-400">Upload your resume to get an instant ATS compatibility score and actionable improvement tips.</p>
        </div>
      </div>

      {!result && (
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
            isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 bg-dark-800 hover:border-slate-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDragging ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-400'}`}>
              <Upload className="w-10 h-10" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-white mb-1">
                Drag and drop your resume here
              </p>
              <p className="text-slate-400 text-sm mb-6">
                Supports PDF format only (Max 5MB)
              </p>
            </div>

            {file && (
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <FileText className="w-5 h-5 text-primary-400" />
                <span className="text-sm font-medium text-white">{file.name}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-2 text-slate-400 hover:text-red-400"
                >
                  &times;
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto mt-4">
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="resume-upload"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl cursor-pointer transition-colors border border-slate-700"
              >
                Browse Files
              </label>
              
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
         <div className="text-center py-12">
            <Loader2 className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Analyzing your resume...</h2>
            <p className="text-slate-400">Our AI is parsing the content, matching keywords, and calculating your ATS score.</p>
         </div>
      )}

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
            <button 
              onClick={() => { setResult(null); setFile(null); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-sm font-medium transition-colors"
            >
              Analyze Another Resume
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className={`md:col-span-1 p-8 rounded-2xl border flex flex-col items-center justify-center ${getScoreColor(result.ats_score)}`}>
              <h3 className="text-lg font-medium opacity-80 mb-4">ATS Compatibility Score</h3>
              <div className="text-7xl font-bold mb-2">
                {result.ats_score}<span className="text-3xl opacity-50">/100</span>
              </div>
              <p className="text-center mt-2 opacity-80 text-sm">
                {result.ats_score >= 80 ? 'Excellent! Your resume is highly optimized for ATS.' : 
                 result.ats_score >= 60 ? 'Good, but there is room for improvement to pass strict filters.' : 
                 'Needs significant work. Many ATS systems will likely reject this.'}
              </p>
            </div>

            <div className="md:col-span-2 space-y-6">
              {/* Missing Keywords */}
              <div className="bg-dark-800 border border-slate-700 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Missing Critical Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                  {result.missing_keywords.length === 0 && (
                    <span className="text-slate-400 text-sm">No major missing keywords detected!</span>
                  )}
                </div>
              </div>

              {/* Strong Points */}
              <div className="bg-dark-800 border border-slate-700 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Strong Points</h3>
                </div>
                <ul className="space-y-2">
                  {result.strong_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                      <span className="text-emerald-500 mt-0.5">•</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="bg-dark-800 border border-slate-700 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Actionable Improvement Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.improvement_tips.map((tip, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                  <p className="text-slate-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
