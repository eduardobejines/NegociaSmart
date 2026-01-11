
import React from 'react';
import { LucideIcon } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, isLoading = false }: any) => {
  const base = "w-full py-3.5 px-4 rounded-xl font-semibold transition-all active:scale-95 flex justify-center items-center backdrop-blur-sm";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 border border-blue-400/20",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10",
    outline: "border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant as keyof typeof variants]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </button>
  );
};

export const Input = ({ label, error, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
    <input 
      className={`w-full p-3 rounded-xl border ${error ? 'border-red-500/50' : 'border-white/10'} bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all backdrop-blur-md`}
      {...props}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export const TextArea = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
    <textarea 
      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px] backdrop-blur-md"
      {...props}
    />
  </div>
);

export const Header = ({ title, subtitle, onBack }: any) => (
  <div className="flex items-center p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
    {onBack && (
      <button onClick={onBack} className="mr-3 p-2 text-gray-300 hover:bg-white/10 rounded-full transition-colors">
        ⬅
      </button>
    )}
    <div>
      <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

export const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl ${className}`}>
    {children}
  </div>
);
