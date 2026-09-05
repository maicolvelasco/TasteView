import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getGreeting, formatLongDate, formatShortTime } from '../../utils/dashboard';

/**
 * Encabezado de bienvenida del Dashboard: saludo contextual + nombre del
 * usuario + fecha/hora, con una ilustración SVG decorativa animada que
 * refuerza la identidad corporativa (usa var(--color-primary), lista para
 * el futuro selector de colores del administrador).
 */
const WelcomeBanner = ({ user }) => {
  const [now, setNow] = useState(new Date());

  // Mantiene la hora al día sin recargar la página (ligero: cada 60s).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'de nuevo';

  return (
    <motion.div
      className="welcome-banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="welcome-banner-text">
        <p className="welcome-banner-eyebrow">{formatLongDate(now)} · {formatShortTime(now)}</p>
        <h2 className="welcome-banner-title">{getGreeting(now)}, {firstName} 👋</h2>
        <p className="welcome-banner-subtitle">
          Este es el resumen de tu restaurante hoy. Todo lo importante, de un vistazo.
        </p>
      </div>

      {/* ── Ilustración decorativa animada ── */}
      <div className="welcome-banner-art" aria-hidden="true">
        <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.circle
            cx="150" cy="80" r="70"
            fill="var(--color-text-on-primary)"
            fillOpacity="0.10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.circle
            cx="60" cy="120" r="34"
            fill="var(--color-text-on-primary)"
            fillOpacity="0.08"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Plato */}
          <motion.g
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            <ellipse cx="150" cy="88" rx="48" ry="48" fill="var(--color-text-on-primary)" fillOpacity="0.16" />
            <ellipse cx="150" cy="88" rx="34" ry="34" fill="var(--color-text-on-primary)" fillOpacity="0.22" />
            <ellipse cx="150" cy="88" rx="20" ry="20" fill="var(--color-text-on-primary)" fillOpacity="0.28" />
          </motion.g>
          {/* Tenedor y cuchillo */}
          <motion.g
            stroke="var(--color-text-on-primary)"
            strokeOpacity="0.55"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0, rotate: -6 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
          >
            <line x1="96" y1="52" x2="96" y2="124" />
            <line x1="90" y1="52" x2="90" y2="70" />
            <line x1="102" y1="52" x2="102" y2="70" />
            <path d="M204 52 C 212 60, 212 76, 204 84 L204 124" />
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
};

export default WelcomeBanner;
