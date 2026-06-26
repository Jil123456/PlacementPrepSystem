import React from 'react';

const ProgressBar = ({ value, max = 100, label, showValue = true, color = 'primary' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    primary: 'from-primary-500 to-primary-400',
    success: 'from-emerald-500 to-emerald-400',
    warning: 'from-amber-500 to-amber-400',
    danger: 'from-rose-500 to-rose-400',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-sm">
          {label && <span className="font-medium text-slate-300">{label}</span>}
          {showValue && <span className="font-semibold text-white">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
        <div 
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
