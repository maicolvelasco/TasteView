import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

/** Tarjeta de categoría, arrastrable para reordenar el menú. */
const CategoryCard = ({ category, isDragging, onDragStart, onDrop, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    className="admin-card admin-card--draggable"
    draggable
    onDragStart={onDragStart}
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
    style={{ opacity: isDragging ? 0.4 : 1 }}
  >
    <div className="category-card-top">
      <GripVertical size={16} className="category-drag-handle" />
      <span className="category-card-icon">{category.icon}</span>
      <div className="category-card-info">
        <h3 className="category-card-name">{category.name}</h3>
        <p className="category-card-count">
          {category.productCount} producto{category.productCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>

    {category.description && <p className="category-card-description">{category.description}</p>}

    <div className="admin-card-actions">
      <button type="button" className="admin-action-btn admin-action-btn--edit" onClick={onEdit}>
        <Pencil size={13} /> Editar
      </button>
      <button type="button" className="admin-action-btn admin-action-btn--delete" onClick={onDelete}>
        <Trash2 size={13} /> Eliminar
      </button>
    </div>
  </motion.div>
);

export default CategoryCard;
