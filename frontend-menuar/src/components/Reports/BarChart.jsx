import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/roles';

/**
 * Gráfico de barras animado para ventas por período o top productos.
 * - Barras: animación scaleY desde 0 con stagger
 * - Tooltip al hover (valor formateado)
 * - Responsive: ocupa todo el ancho disponible
 * - Eje Y: 4 líneas de referencia con valores
 *
 * Props:
 *  - data   : Array<{ label?: string, name?: string, total?: number, total_revenue?: number }>
 *  - color  : color CSS de las barras (default: var(--color-primary))
 *  - height : altura del área de barras en px (default 200)
 *  - valueKey: qué campo de dato usar como valor ('total' | 'total_revenue')
 */
const BarChart = ({
  data = [],
  color = 'var(--color-primary)',
  height = 200,
  valueKey,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data.length) {
    return (
      <div className="bar-chart-empty">
        <p>Sin datos para mostrar</p>
      </div>
    );
  }

  // Determinar qué campo usar como valor
  const getValue = (d) => {
    if (valueKey) return d[valueKey] || 0;
    return d.total ?? d.total_revenue ?? 0;
  };

  const getLabel = (d) => d.label ?? d.name ?? '';

  const maxValue = Math.max(...data.map(getValue), 1);

  // Líneas de referencia del eje Y
  const yLines = [0.25, 0.5, 0.75, 1].map((f) => ({
    fraction: f,
    value: maxValue * f,
  }));

  return (
    <div className="bar-chart" style={{ '--bar-chart-height': `${height}px` }}>
      {/* ── Eje Y ── */}
      <div className="bar-chart-y-axis">
        {[...yLines].reverse().map(({ fraction, value }) => (
          <span key={fraction} className="bar-chart-y-label">
            {value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : Math.round(value)}
          </span>
        ))}
      </div>

      {/* ── Área de barras ── */}
      <div className="bar-chart-area">
        {/* Líneas horizontales de referencia */}
        {yLines.map(({ fraction }) => (
          <div
            key={fraction}
            className="bar-chart-grid-line"
            style={{ bottom: `${fraction * 100}%` }}
          />
        ))}

        {/* Barras */}
        {data.map((item, i) => {
          const value = getValue(item);
          const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              className="bar-chart-col"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="bar-chart-tooltip"
                    initial={{ opacity: 0, y: 4, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="bar-chart-tooltip-label">{getLabel(item)}</span>
                    <span className="bar-chart-tooltip-value" style={{ color }}>
                      {formatCurrency(value)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Barra */}
              <div className="bar-chart-bar-wrap">
                <motion.div
                  className="bar-chart-bar"
                  style={{
                    height: `${Math.max(heightPct, 2)}%`,
                    background: isHovered
                      ? color
                      : `linear-gradient(to top, ${color}, ${color}88)`,
                    opacity: hoveredIdx !== null && !isHovered ? 0.55 : 1,
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.04,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                />
              </div>

              {/* Etiqueta X */}
              <span className="bar-chart-x-label" title={getLabel(item)}>
                {getLabel(item)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
