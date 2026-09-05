import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { NavIcon } from '../../icons';

/**
 * Grilla de accesos rápidos a las secciones administrativas.
 * `actions` viene de utils/dashboard.js#buildQuickActions, ya filtrado
 * según el rol del usuario.
 */
const QuickActionsGrid = ({ actions }) => (
  <div className="quick-actions-grid">
    {actions.map((action, i) => (
      <motion.div
        key={action.path}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: i * 0.04, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
      >
        <Link to={action.path} className="quick-action-card">
          <span className="quick-action-icon">
            <NavIcon name={action.icon} size={19} strokeWidth={2} />
          </span>
          <span className="quick-action-text">
            <span className="quick-action-label">{action.label}</span>
            <span className="quick-action-description">{action.description}</span>
          </span>
          <ChevronRight size={16} className="quick-action-arrow" />
        </Link>
      </motion.div>
    ))}
  </div>
);

export default QuickActionsGrid;
