import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-primary-900/50 text-primary-300 border-primary-500/30',
    success: 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30', // Easy
    warning: 'bg-amber-900/50 text-amber-300 border-amber-500/30',     // Medium
    danger: 'bg-rose-900/50 text-rose-300 border-rose-500/30',         // Hard
  };

  // Map difficulty levels explicitly if they are passed as variants
  let mappedVariant = variant;
  if (variant.toLowerCase() === 'easy') mappedVariant = 'success';
  if (variant.toLowerCase() === 'medium') mappedVariant = 'warning';
  if (variant.toLowerCase() === 'hard') mappedVariant = 'danger';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[mappedVariant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
