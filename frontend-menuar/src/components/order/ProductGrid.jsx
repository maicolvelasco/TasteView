import React from 'react';
import { SearchX } from 'lucide-react';
import ProductGridCard from './ProductGridCard';
import EmptyStateCard from '../ui/EmptyStateCard';

/** Grilla responsiva de platos, con estado vacío cuando la búsqueda no encuentra nada. */
const ProductGrid = ({ products, onAdd }) => (
  <div className="order-product-grid">
    {products.map((product) => (
      <ProductGridCard key={product.id} product={product} onAdd={onAdd} />
    ))}
    {products.length === 0 && (
      <EmptyStateCard
        icon={SearchX}
        title="Sin resultados"
        message="No hay platos que coincidan con tu búsqueda o categoría."
      />
    )}
  </div>
);

export default ProductGrid;
