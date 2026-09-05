import React from 'react';
import { motion } from 'framer-motion';
import { Clock, PackagePlus, SlidersHorizontal, UtensilsCrossed, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/roles';
import { formatPrepTime } from '../../utils/menu';

/**
 * Tarjeta de producto del menú público. Al tocarla abre MenuProductModal
 * con el detalle completo (descripción, ingredientes, historia, AR).
 */
const MenuProductCard = ({ product, categoryLabel, delay = 0, onSelect }) => {
  const prepTime = formatPrepTime(product.preparation_time_min);
  const hasModifiers = product.has_modifiers || (product.modifiers?.length ?? 0) > 0;

  return (
    <motion.button
      type="button"
      className="menu-product-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(product)}
    >
      <div
        className="menu-product-card-thumb"
        style={product.image_url ? { backgroundImage: `url(${product.image_url})` } : undefined}
      >
        {!product.image_url && <UtensilsCrossed size={28} strokeWidth={1.75} />}
      </div>

      <div className="menu-product-card-body">
        <div className="menu-product-card-header">
          <h3 className="menu-product-card-name">{product.name}</h3>
          <span className="menu-product-card-price">{formatCurrency(product.price ?? 0)}</span>
        </div>

        {categoryLabel && (
          <p className="menu-product-card-category">{categoryLabel}</p>
        )}

        <p className="menu-product-card-desc">
          {product.description || 'Sin descripción disponible.'}
        </p>

        <div className="menu-product-card-tags">
          {product.model_3d_url && (
            <span className="menu-product-tag menu-product-tag--ar">
              <Eye size={12} strokeWidth={2} /> Ver en AR
            </span>
          )}
          {hasModifiers && (
            <span className="menu-product-tag menu-product-tag--custom">
              <SlidersHorizontal size={12} strokeWidth={2} /> Personalizable
            </span>
          )}
          {product.is_combo && (
            <span className="menu-product-tag menu-product-tag--combo">
              <PackagePlus size={12} strokeWidth={2} /> Combo
            </span>
          )}
          {prepTime && (
            <span className="menu-product-tag menu-product-tag--time">
              <Clock size={12} strokeWidth={2} /> {prepTime}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default MenuProductCard;
