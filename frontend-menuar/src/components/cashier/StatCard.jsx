import React from 'react';
import { motion } from 'framer-motion';

/** Tarjeta individual de estadística (usada por StatsGrid). */
const StatCard = ({ icon: Icon, label, value, tone = 'primary', delay = 0 }) => (
  <motion.div
    className={`cashier-stat cashier-stat--${tone}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    whileHover={{ y: -3 }}
  >
    <span className="cashier-stat-icon">
      <Icon size={20} strokeWidth={2} />
    </span>
    <div className="cashier-stat-text">
      <p className="cashier-stat-value">{value}</p>
      <p className="cashier-stat-label">{label}</p>
    </div>
  </motion.div>
);

export default StatCard;
