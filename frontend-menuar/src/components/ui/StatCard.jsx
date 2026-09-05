import React from 'react';
import { motion } from 'framer-motion';

/**
 * Tarjeta de estadística genérica (ícono + valor + etiqueta), usada en la
 * fila de resumen de las pantallas de administración (Reservas, Mesas...).
 * `tone` reutiliza la misma paleta semántica de StatusBadge/Badge.
 */
const StatCard = ({ icon: Icon, label, value, tone = 'primary', delay = 0 }) => (
  <motion.div
    className={`stat-card stat-card--${tone}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    whileHover={{ y: -3 }}
  >
    <span className="stat-card-icon">
      <Icon size={19} strokeWidth={2} />
    </span>
    <div className="stat-card-text">
      <p className="stat-card-value">{value}</p>
      <p className="stat-card-label">{label}</p>
    </div>
  </motion.div>
);

export default StatCard;
