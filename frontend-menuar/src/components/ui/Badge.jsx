import React from 'react';

/**
 * Badge genérico de "tono" (warning/info/primary/success/error/neutral).
 * StatusBadge (pedidos) usa un mapeo fijo de estado -> tono; este componente
 * es la base visual para cualquier otra pantalla (reservas, mesas, etc.) que
 * necesite el mismo lenguaje de badges sin acoplarse a utils/orders.js.
 */
const Badge = ({ tone = 'primary', children, className = '' }) => (
  <span className={`status-badge status-badge--${tone} ${className}`}>{children}</span>
);

export default Badge;
