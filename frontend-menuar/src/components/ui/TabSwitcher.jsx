import React from 'react';
import { motion } from 'framer-motion';

/**
 * Selector de pestañas genérico con una "píldora" que se desliza entre
 * opciones (framer-motion layoutId). `tabs` es un array de
 * { key, label, icon: Componente, count? }. `layoutId` debe ser único por
 * cada grupo de tabs visible simultáneamente en pantalla.
 */
const TabSwitcher = ({ tabs, active, onChange, layoutId = 'tab-switcher-pill' }) => (
  <div className="tab-switcher" role="tablist">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = active === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={`tab-switcher-tab ${isActive ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {isActive && (
            <motion.span
              layoutId={layoutId}
              className="tab-switcher-pill"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className="tab-switcher-content">
            {Icon && <Icon size={16} strokeWidth={2} />}
            {tab.label}
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span className="tab-switcher-count">{tab.count}</span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

export default TabSwitcher;
