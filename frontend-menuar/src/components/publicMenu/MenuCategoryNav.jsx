import React from 'react';
import { motion } from 'framer-motion';

/**
 * Nav de categorías del menú público. Misma técnica de "píldora deslizante"
 * que TabSwitcher/PeriodSelector, pero con íconos emoji (los que el admin
 * elige por categoría en CategoryForm) en vez de componentes de lucide-react.
 */
const MenuCategoryNav = ({ categories, active, onChange }) => (
  <div className="public-menu-category-nav" role="tablist" aria-label="Categorías del menú">
    {categories.map((cat) => {
      const isActive = active === cat.key;
      return (
        <button
          key={cat.key}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={`public-menu-category-btn ${isActive ? 'active' : ''}`}
          onClick={() => onChange(cat.key)}
        >
          {isActive && (
            <motion.span
              layoutId="public-menu-category-pill"
              className="public-menu-category-pill"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className="public-menu-category-content">
            <span className="public-menu-category-icon">{cat.icon}</span>
            {cat.label}
            {cat.count > 0 && (
              <span className="public-menu-category-count">{cat.count}</span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

export default MenuCategoryNav;
