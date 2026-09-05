import React from 'react';
import { motion } from 'framer-motion';

/**
 * Estado vacío reutilizable (sin pedidos, sin facturas, sin resultados de
 * búsqueda...). El ícono flota suavemente en loop para que la pantalla no se
 * sienta "muerta" cuando no hay datos.
 */
const EmptyStateCard = ({ icon: Icon, title, message, className = '' }) => (
  <div className={`empty-state-card ${className}`}>
    <motion.div
      className="empty-state-icon"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon size={30} strokeWidth={1.75} />
    </motion.div>
    <p className="empty-state-title">{title}</p>
    {message && <p className="empty-state-message">{message}</p>}
  </div>
);

export default EmptyStateCard;
