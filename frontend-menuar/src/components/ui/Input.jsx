import React from 'react';

const baseClasses =
  'w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm outline-none transition-colors placeholder:text-slate-500 focus:border-sky-400';

export const Input = ({ className = '', ...rest }) => (
  <input className={`${baseClasses} ${className}`} {...rest} />
);

export const Textarea = ({ className = '', rows = 3, ...rest }) => (
  <textarea className={`${baseClasses} min-h-[60px] resize-y ${className}`} rows={rows} {...rest} />
);

export const Select = ({ className = '', children, ...rest }) => (
  <select className={`${baseClasses} ${className}`} {...rest}>
    {children}
  </select>
);
