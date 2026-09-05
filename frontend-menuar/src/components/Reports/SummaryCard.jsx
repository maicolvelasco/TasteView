import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Tarjeta de métrica con animación de counter (de 0 al valor destino).
 * Usa un SVG de arco de progreso decorativo y Framer Motion para la entrada.
 *
 * Props:
 *  - icon       : componente lucide-react
 *  - label      : string  (etiqueta inferior)
 *  - rawValue   : number  (valor numérico para la animación)
 *  - displayValue: string (valor formateado para mostrar, ej. "Bs. 1.200")
 *  - tone       : 'primary' | 'success' | 'info' | 'warning' | 'error'
 *  - delay      : número de segundos de retraso de entrada
 *  - trend      : { value: number, label: string } | null  (tendencia opcional)
 */

const TONE_COLORS = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  info:    'var(--color-info)',
  warning: 'var(--color-warning)',
  error:   'var(--color-error)',
};

function useCountUp(target, duration = 1200, started = false) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const startVal = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, started]);

  return current;
}

const SummaryCard = ({ icon: Icon, label, rawValue = 0, displayValue, tone = 'primary', delay = 0, trend }) => {
  const [visible, setVisible] = useState(false);
  const color = TONE_COLORS[tone] ?? TONE_COLORS.primary;
  const animatedCount = useCountUp(rawValue, 1000, visible);

  return (
    <motion.div
      className={`summary-card summary-card--${tone}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      onAnimationComplete={() => setVisible(true)}
    >
      {/* ── Icono con anillo SVG decorativo ── */}
      <div className="summary-card-icon-wrap">
        <svg className="summary-card-ring" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="25" stroke={color} strokeOpacity="0.15" strokeWidth="3" />
          <motion.circle
            cx="28" cy="28" r="25"
            stroke={color} strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="157"
            initial={{ strokeDashoffset: 157 }}
            animate={visible ? { strokeDashoffset: 40 } : {}}
            transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px' }}
          />
        </svg>
        <span className="summary-card-icon" style={{ color }}>
          <Icon size={22} strokeWidth={2} />
        </span>
      </div>

      {/* ── Valor y etiqueta ── */}
      <div className="summary-card-text">
        <p className="summary-card-value" style={{ color }}>
          {displayValue ?? animatedCount}
        </p>
        <p className="summary-card-label">{label}</p>
        {trend && (
          <p className={`summary-card-trend summary-card-trend--${trend.value >= 0 ? 'up' : 'down'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default SummaryCard;
