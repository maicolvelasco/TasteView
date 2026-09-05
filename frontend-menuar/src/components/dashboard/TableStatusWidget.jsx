import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Armchair } from 'lucide-react';
import EmptyStateCard from '../ui/EmptyStateCard';
import { getOccupancyPct } from '../../utils/dashboard';

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Anillo de ocupación de mesas (mismo lenguaje visual que el anillo SVG de
 * SummaryCard, en tamaño mayor y como pieza central de su propia tarjeta).
 * Props: free, occupied — cantidad de mesas en cada estado.
 */
const TableStatusWidget = ({ free = 0, occupied = 0 }) => {
  const [visible, setVisible] = useState(false);
  const total = free + occupied;
  const pct = getOccupancyPct(occupied, free);
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  if (total === 0) {
    return (
      <EmptyStateCard
        icon={Armchair}
        title="Sin mesas configuradas"
        message="Registra las mesas de tu salón en la sección Mesas."
      />
    );
  }

  return (
    <div className="table-status-widget">
      <div className="table-status-ring-wrap">
        <svg viewBox="0 0 140 140" className="table-status-ring">
          <circle cx="70" cy="70" r={RADIUS} stroke="var(--color-border)" strokeWidth="12" fill="none" />
          <motion.circle
            cx="70" cy="70" r={RADIUS}
            stroke="var(--color-primary)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
            onAnimationComplete={() => setVisible(true)}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
          />
        </svg>
        <div className="table-status-ring-center">
          <motion.span
            className="table-status-ring-pct"
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            {pct}%
          </motion.span>
          <span className="table-status-ring-label">ocupación</span>
        </div>
      </div>

      <div className="table-status-legend">
        <div className="table-status-legend-item">
          <span className="table-status-dot table-status-dot--occupied" />
          <span className="table-status-legend-text">Ocupadas</span>
          <span className="table-status-legend-value">{occupied}</span>
        </div>
        <div className="table-status-legend-item">
          <span className="table-status-dot table-status-dot--free" />
          <span className="table-status-legend-text">Libres</span>
          <span className="table-status-legend-value">{free}</span>
        </div>
        <div className="table-status-legend-item table-status-legend-item--total">
          <span className="table-status-legend-text">Total mesas</span>
          <span className="table-status-legend-value">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default TableStatusWidget;
