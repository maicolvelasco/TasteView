import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/roles';

/**
 * Lista de top productos más vendidos.
 * - Medallas SVG animadas para los 3 primeros (oro, plata, bronce)
 * - Barra de progreso proporcional al máximo
 * - Unidades vendidas + ingresos
 * - Animación de entrada stagger
 */

const MEDAL_COLORS = {
  0: { fill: '#F59E0B', stroke: '#D97706', text: '#78350F' }, // oro
  1: { fill: '#94A3B8', stroke: '#64748B', text: '#1E293B' }, // plata
  2: { fill: '#CD7C3B', stroke: '#B45309', text: '#7C2D12' }, // bronce
};

const MedalSvg = ({ position }) => {
  const palette = MEDAL_COLORS[position];
  if (!palette) return null;
  return (
    <motion.svg
      width="28" height="28" viewBox="0 0 28 28" fill="none"
      initial={{ rotate: -20, scale: 0.6, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18, delay: position * 0.08 }}
    >
      <circle cx="14" cy="14" r="12" fill={palette.fill} stroke={palette.stroke} strokeWidth="1.5" />
      <text
        x="14" y="14" dominantBaseline="central" textAnchor="middle"
        fontSize="11" fontWeight="700" fill={palette.text}
      >
        {position + 1}
      </text>
    </motion.svg>
  );
};

const RankNumber = ({ position, delay }) => (
  <motion.div
    className="top-products-rank"
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.25 }}
  >
    {position + 1}
  </motion.div>
);

const TopProductsList = ({ products = [] }) => {
  if (!products.length) {
    return (
      <div className="top-products-empty">
        <TrendingUp size={24} strokeWidth={1.5} />
        <p>Sin datos de productos</p>
      </div>
    );
  }

  const maxSold = Math.max(...products.map((p) => p.total_sold || 0), 1);

  return (
    <div className="top-products-list">
      {products.map((product, i) => {
        const pct = ((product.total_sold || 0) / maxSold) * 100;
        const delay = i * 0.05;
        const hasMedal = i < 3;

        return (
          <motion.div
            key={product.id ?? i}
            className="top-products-item"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay, ease: 'easeOut' }}
            whileHover={{ x: 4 }}
          >
            {/* Medalla o número */}
            <div className="top-products-rank-wrap">
              {hasMedal
                ? <MedalSvg position={i} />
                : <RankNumber position={i} delay={delay} />
              }
            </div>

            {/* Nombre + barra de progreso */}
            <div className="top-products-info">
              <div className="top-products-name-row">
                <span className="top-products-name">{product.name}</span>
                <span className="top-products-sold">{product.total_sold ?? 0} uds.</span>
              </div>
              <div className="top-products-bar-bg">
                <motion.div
                  className="top-products-bar-fill"
                  style={{
                    background: hasMedal
                      ? `linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))`
                      : 'var(--color-border-strong)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: delay + 0.15, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Ingresos */}
            <span className="top-products-revenue">
              {formatCurrency(product.total_revenue || 0)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TopProductsList;
