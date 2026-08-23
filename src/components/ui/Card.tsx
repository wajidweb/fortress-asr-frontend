import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
