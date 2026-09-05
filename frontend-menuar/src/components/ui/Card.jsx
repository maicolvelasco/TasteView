import React from 'react';

const Card = ({ className = '', children, ...rest }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-2xl p-5 ${className}`} {...rest}>
    {children}
  </div>
);

export default Card;
