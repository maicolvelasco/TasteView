import React from 'react';

const VARIANTS = {
  primary: 'bg-gradient-to-br from-sky-400 to-sky-500 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-sky-400/30',
  danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:-translate-y-px',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:-translate-y-px',
  warning: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:-translate-y-px',
  ghost: 'bg-slate-700/60 text-slate-200 hover:bg-slate-700',
  subtle: 'bg-slate-500/10 text-slate-300 hover:bg-slate-500/20',
};

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  sm: 'px-2.5 py-1.5 text-xs',
};

/**
 * Botón base de la app. Envuelve los estilos comunes (color, tamaño, hover)
 * para no repetir `style={{...}}` en cada pantalla.
 */
const Button = ({ variant = 'primary', size = 'md', className = '', children, ...rest }) => (
  <button
    className={`rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
