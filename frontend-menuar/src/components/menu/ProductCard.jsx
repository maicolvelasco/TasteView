import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, PackagePlus, Pencil, SlidersHorizontal, Trash2, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/roles';

/**
 * Tarjeta de un producto en la grilla del menú. Es "arrastrable" cuando se
 * está viendo una categoría puntual (para reordenar), no en la vista "Todas".
 */
const ProductCard = ({ product, draggable, isDragging, onDragStart, onDrop, onToggleAvailability, onDuplicate, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    className={`admin-card ${draggable ? 'admin-card--draggable' : ''}`}
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
    style={{ opacity: isDragging ? 0.4 : 1 }}
  >
    <div
      className="product-card-thumb"
      style={product.image_url ? { backgroundImage: `url(${product.image_url})` } : undefined}
    >
      {!product.image_url && '🍽️'}
      {product.is_combo && (
        <span className="product-card-combo-badge">
          <PackagePlus size={11} /> Combo
        </span>
      )}
    </div>

    <div className="admin-card-header">
      <h4 className="product-card-name">{product.name}</h4>
      <span className="product-card-price">{formatCurrency(product.price)}</span>
    </div>
    <p className="product-card-category">{product.categoryName}</p>
    {product.modifiers?.length > 0 && (
      <p className="product-card-modifiers">
        <SlidersHorizontal size={12} /> {product.modifiers.map((m) => m.name).join(' · ')}
      </p>
    )}

    <div className="admin-card-actions">
      <button
        type="button"
        onClick={onToggleAvailability}
        className={`admin-action-btn ${product.is_available ? 'admin-action-btn--on' : 'admin-action-btn--off'}`}
      >
        {product.is_available ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
        {product.is_available ? 'Disponible' : 'No disponible'}
      </button>
      <button type="button" onClick={onDuplicate} className="admin-action-btn admin-action-btn--duplicate">
        <Copy size={13} /> Duplicar
      </button>
      <button type="button" onClick={onEdit} className="admin-action-btn admin-action-btn--edit">
        <Pencil size={13} /> Editar
      </button>
      <button type="button" onClick={onDelete} className="admin-action-btn admin-action-btn--delete">
        <Trash2 size={13} /> Eliminar
      </button>
    </div>
  </motion.div>
);

export default ProductCard;
