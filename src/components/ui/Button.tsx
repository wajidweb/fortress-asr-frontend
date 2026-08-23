import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white focus:ring-brand-500',
    secondary: 'bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 focus:ring-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
