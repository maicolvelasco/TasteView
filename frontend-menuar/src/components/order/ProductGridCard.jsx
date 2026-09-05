import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../../utils/roles';

/** Tarjeta de un plato disponible para agregar al carrito. */
const ProductGridCard = ({ product, onAdd }) => (
  <motion.button
    type="button"
    layout
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => onAdd(product)}
    className="order-product-card"
  >
    <div className="order-product-thumb" style={product.image_url ? { backgroundImage: `url(${product.image_url})` } : undefined}>
      {!product.image_url && '🍽️'}
    </div>
    <h4 className="order-product-name">{product.name}</h4>
    <div className="order-product-footer">
      <span className="order-product-price">{formatCurrency(product.price)}</span>
      {product.has_modifiers && (
        <span className="order-product-options">
          <SlidersHorizontal size={12} /> Opciones
        </span>
      )}
    </div>
  </motion.button>
);

export default ProductGridCard;
