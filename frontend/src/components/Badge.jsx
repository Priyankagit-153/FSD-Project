import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    // Status specific mappings
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200 line-through'
  };

  const sizes = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  const selectedVariant = variants[variant] || variants.default;
  const selectedSize = sizes[size] || sizes.sm;

  return (
    <span className={`inline-flex items-center rounded-full border ${selectedVariant} ${selectedSize} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
