import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CalendarCheck, ClipboardList, UtensilsCrossed } from 'lucide-react';

const FEATURES = [
  { icon: ClipboardList, label: 'Pedidos en tiempo real' },
  { icon: CalendarCheck, label: 'Reservas y mesas al día' },
  { icon: BarChart3, label: 'Reportes al instante' },
];

/**
 * Panel de marca del Login (columna izquierda en pantallas anchas). Usa el
 * degradado corporativo (var(--color-primary)) y una ilustración SVG
 * animada, listo para el futuro selector de colores del administrador.
 */
const LoginBrandPanel = ({ appName = 'Restaurant AR' }) => (
  <div className="login-brand-panel">
    {/* ── Ilustración decorativa animada ── */}
    <svg className="login-brand-art" viewBox="0 0 320 320" aria-hidden="true">
      <motion.circle
        cx="250" cy="70" r="90"
        fill="var(--color-text-on-primary)" fillOpacity="0.08"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="50" cy="270" r="70"
        fill="var(--color-text-on-primary)" fillOpacity="0.07"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
      <motion.g
        initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <ellipse cx="160" cy="170" rx="86" ry="86" fill="var(--color-text-on-primary)" fillOpacity="0.14" />
        <ellipse cx="160" cy="170" rx="62" ry="62" fill="var(--color-text-on-primary)" fillOpacity="0.18" />
        <ellipse cx="160" cy="170" rx="38" ry="38" fill="var(--color-text-on-primary)" fillOpacity="0.24" />
      </motion.g>
      <motion.g
        stroke="var(--color-text-on-primary)"
        strokeOpacity="0.5"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
      >
        <line x1="90" y1="120" x2="90" y2="220" />
        <line x1="80" y1="120" x2="80" y2="150" />
        <line x1="100" y1="120" x2="100" y2="150" />
        <path d="M232 120 C 244 132, 244 156, 232 168 L232 220" />
      </motion.g>
    </svg>

    <div className="login-brand-content">
      <motion.span
        className="login-brand-icon"
        initial={{ scale: 0.7, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        <UtensilsCrossed size={28} strokeWidth={2} />
      </motion.span>

      <h1 className="login-brand-title">{appName}</h1>
      <p className="login-brand-subtitle">Sistema de Gestión Gastronómica</p>

      <ul className="login-brand-features">
        {FEATURES.map(({ icon: Icon, label }, i) => (
          <motion.li
            key={label}
            className="login-brand-feature"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </motion.li>
        ))}
      </ul>
    </div>
  </div>
);

export default LoginBrandPanel;
