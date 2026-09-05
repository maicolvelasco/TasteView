// Lógica pura de la pantalla de Menú Público: armado de pestañas de
// categoría y filtrado/búsqueda de productos. Sin JSX a propósito (mismo
// criterio que utils/navigation.js y utils/dashboard.js) para poder
// testear sin depender de React.

/** Solo productos disponibles; `is_available` ausente se trata como visible. */
export function isProductVisible(product) {
  return product?.is_available !== false;
}

/** Arma las pestañas de categoría (ícono emoji + nombre + cantidad de productos visibles). */
export function buildCategoryTabs(categories = []) {
  return categories.map((cat) => ({
    key: cat.id,
    label: cat.name,
    icon: cat.icon,
    count: (cat.products || []).filter(isProductVisible).length,
  }));
}

/**
 * Devuelve los productos a mostrar según haya o no búsqueda activa.
 * - Con búsqueda: recorre TODAS las categorías y devuelve coincidencias por
 *   nombre o descripción, con `_categoryName` para dar contexto en la tarjeta.
 * - Sin búsqueda: solo los productos disponibles de la categoría activa.
 */
export function getVisibleProducts({ categories = [], activeCategory, searchTerm = '' }) {
  const term = searchTerm.trim().toLowerCase();

  if (term) {
    const results = [];
    categories.forEach((cat) => {
      (cat.products || []).filter(isProductVisible).forEach((product) => {
        const haystack = `${product.name || ''} ${product.description || ''}`.toLowerCase();
        if (haystack.includes(term)) {
          results.push({ ...product, _categoryName: cat.name });
        }
      });
    });
    return results;
  }

  const activeCat = categories.find((cat) => cat.id === activeCategory);
  return (activeCat?.products || []).filter(isProductVisible);
}

/** Tiempo de preparación legible, o null si no aplica. */
export function formatPrepTime(minutes) {
  if (!minutes && minutes !== 0) return null;
  return `${minutes} min`;
}
