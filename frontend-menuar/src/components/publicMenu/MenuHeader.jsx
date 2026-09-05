import React from 'react';
import { motion } from 'framer-motion';
import { Armchair, UtensilsCrossed } from 'lucide-react';

/**
 * Encabezado del Menú Digital Público. Usa la misma paleta corporativa
 * (var(--color-primary)) que el resto de la app, lista para el futuro
 * selector de colores del administrador.
 */
const MenuHeader = ({ branchName, tableNumber }) => (
  <motion.header
    className="public-menu-header"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  >
    {/* ── Decoración SVG animada de fondo ── */}
    <svg className="public-menu-header-art" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
      <motion.circle
        cx="40" cy="30" r="60"
        fill="var(--color-text-on-primary)" fillOpacity="0.08"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="360" cy="110" r="80"
        fill="var(--color-text-on-primary)" fillOpacity="0.07"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </svg>

    <div className="public-menu-header-content">
      <motion.span
        className="public-menu-header-icon"
        initial={{ scale: 0.7, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
      >
        <UtensilsCrossed size={26} strokeWidth={2} />
      </motion.span>

      <h1 className="public-menu-header-title">{branchName || 'Restaurant AR'}</h1>
      <p className="public-menu-header-subtitle">Menú Digital Interactivo</p>

      {tableNumber && (
        <motion.span
          className="public-menu-table-badge"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Armchair size={13} strokeWidth={2} />
          Mesa {tableNumber}
        </motion.span>
      )}
    </div>
  </motion.header>
);

export default MenuHeader;
