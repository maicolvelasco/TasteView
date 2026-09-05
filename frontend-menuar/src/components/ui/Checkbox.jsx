import React from 'react';

/**
 * Checkbox con label integrado. `size` controla el tamaño del cuadrito
 * (usamos 'sm' dentro de listas densas, como el picker de opciones).
 */
const Checkbox = ({ label, id, size = 'md', className = '', ...rest }) => {
  const boxSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]';
  return (
    <label htmlFor={id} className={`flex items-center gap-2 cursor-pointer select-none ${className}`}>
      <input id={id} type="checkbox" className={`${boxSize} accent-sky-400`} {...rest} />
      {label && <span className="text-sm text-slate-200">{label}</span>}
    </label>
  );
};

export default Checkbox;
