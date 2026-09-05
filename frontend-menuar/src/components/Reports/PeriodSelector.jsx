import React from 'react';
import { motion } from 'framer-motion';

/**
 * Selector de período (Hoy / Semana / Mes) con píldora animada deslizable.
 * Misma mecánica que TabSwitcher pero autónomo y estilizado para reportes.
 */

const PERIODS = [
  { key: 'day',   label: 'Hoy' },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

const PeriodSelector = ({ value, onChange }) => (
  <div className="period-selector" role="group" aria-label="Período de reporte">
    {PERIODS.map(({ key, label }) => {
      const isActive = value === key;
      return (
        <button
          key={key}
          type="button"
          className={`period-selector-btn ${isActive ? 'active' : ''}`}
          onClick={() => onChange(key)}
          aria-pressed={isActive}
        >
          {isActive && (
            <motion.span
              layoutId="period-pill"
              className="period-selector-pill"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className="period-selector-label">{label}</span>
        </button>
      );
    })}
  </div>
);

export default PeriodSelector;
