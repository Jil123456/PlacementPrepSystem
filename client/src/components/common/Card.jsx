import React from 'react';

const Card = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'glass border-slate-700/50',
    success: 'bg-emerald-900/20 border border-emerald-500/30 backdrop-blur',
    warning: 'bg-amber-900/20 border border-amber-500/30 backdrop-blur',
    danger: 'bg-rose-900/20 border border-rose-500/30 backdrop-blur',
  };

  return (
    <div className={`rounded-xl overflow-hidden ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
