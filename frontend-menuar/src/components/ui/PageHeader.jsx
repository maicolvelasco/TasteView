import React from 'react';
import { motion } from 'framer-motion';

/**
 * Encabezado de página reutilizable (ícono de marca + título + subtítulo).
 * Usado por Caja, Toma de Pedidos y cualquier pantalla futura que necesite
 * el mismo tratamiento visual corporativo.
 */
const PageHeader = ({ icon: Icon, title, subtitle }) => (
  <motion.div
    className="page-header"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
  >
    <span className="page-header-icon">
      <Icon size={26} strokeWidth={2} />
    </span>
    <div>
      <h1 className="page-header-title">{title}</h1>
      {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
    </div>
  </motion.div>
);

export default PageHeader;
