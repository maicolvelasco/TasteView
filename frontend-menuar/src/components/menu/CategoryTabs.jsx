import React from 'react';
import { motion } from 'framer-motion';

/** Filtro por categoría (solo lectura; la gestión de categorías vive en /admin/categories). */
const CategoryTabs = ({ categories, products, active, onChange }) => (
  <div className="menu-category-chips">
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => onChange('all')}
      className={`menu-category-chip ${active === 'all' ? 'active' : ''}`}
    >
      Todas ({products.length})
    </motion.button>
    {categories.map((cat) => (
      <motion.button
        key={cat.id}
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => onChange(cat.id)}
        className={`menu-category-chip ${active === cat.id ? 'active' : ''}`}
      >
        {cat.icon} {cat.name} ({products.filter((p) => p.category_id === cat.id).length})
      </motion.button>
    ))}
  </div>
);

export default CategoryTabs;
