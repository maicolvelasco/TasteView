import React from 'react';
import { motion } from 'framer-motion';

/** Chips de filtro por categoría. Se ocultan visualmente durante una búsqueda activa (ver OrderForm.jsx). */
const CategoryChips = ({ categories, active, onChange }) => (
  <div className="order-category-chips">
    {categories.map((cat) => (
      <motion.button
        key={cat.id}
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => onChange(cat.id)}
        className={`order-category-chip ${active === cat.id ? 'active' : ''}`}
      >
        {cat.icon} {cat.name}
      </motion.button>
    ))}
  </div>
);

export default CategoryChips;
