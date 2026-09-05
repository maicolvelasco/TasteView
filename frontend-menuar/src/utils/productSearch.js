// Lógica pura de búsqueda/filtrado de productos, compartida por la toma de
// pedidos (Mesero/Caja) y la administración del menú (Admin). Sin JSX a
// propósito, igual que el resto de utils/.

/**
 * Filtra productos por texto de búsqueda y, si no hay búsqueda activa, por
 * categoría. Al buscar se ignora la categoría a propósito: con catálogos de
 * 50+ platos, el usuario quiere encontrar el producto sin importar en qué
 * categoría esté agrupado.
 */
export function filterProductsByCategoryAndSearch(products, { categoryId, searchTerm }) {
  const term = (searchTerm || '').trim().toLowerCase();

  if (term) {
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }
  if (!categoryId || categoryId === 'all') return products;
  return products.filter((p) => p.category_id === categoryId);
}

/** Cuenta cuántos productos tiene cada categoría, para las badges de los chips de filtro. */
export function countProductsByCategory(products) {
  const counts = {};
  products.forEach((p) => {
    counts[p.category_id] = (counts[p.category_id] || 0) + 1;
  });
  return counts;
}
