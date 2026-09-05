// Lógica pura de la toma de pedidos (Mesero y Caja comparten esta misma
// pantalla vía components/OrderForm.jsx). Sin JSX a propósito, igual que
// utils/navigation.js y utils/cashier.js, para poder testear sin React.

import { filterProductsByCategoryAndSearch } from './productSearch';

export const ORDER_TYPES = [
  { value: 'dine_in', label: 'Comer aquí', icon: 'utensils' },
  { value: 'takeout', label: 'Para llevar', icon: 'package' },
  { value: 'delivery', label: 'Delivery', icon: 'bike' },
];

/**
 * Filtra productos por texto de búsqueda y, si no hay búsqueda activa, por
 * categoría. Al buscar se ignora la categoría a propósito: con 50+ platos el
 * cajero/mesero quiere encontrar el producto sin importar en qué categoría
 * esté agrupado. (Delegado a utils/productSearch.js, reutilizado también
 * por la administración del menú.)
 */
export function filterOrderProducts(products, { categoryId, searchTerm }) {
  return filterProductsByCategoryAndSearch(products, { categoryId, searchTerm });
}

/** Total de un solo ítem del carrito (precio base + ajustes de modificadores) x cantidad. */
export function computeCartItemSubtotal(item) {
  const modifiersTotal = item.modifiers?.reduce((sum, m) => sum + (m.price_adjustment || 0), 0) || 0;
  return (item.price + modifiersTotal) * item.quantity;
}

/** Total general del carrito. */
export function computeCartTotal(cart) {
  return cart.reduce((sum, item) => sum + computeCartItemSubtotal(item), 0);
}
