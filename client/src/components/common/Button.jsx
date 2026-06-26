import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  loading = false,
  fullWidth = false
}) => {
  const baseStyle = "relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 focus:ring-slate-500",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]",
    outline: "border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10 focus:ring-primary-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
