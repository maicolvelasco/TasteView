import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { getAdminMenu } from '../services/menu';

const buildErrorMessage = (err) => {
  const backendMsg = err.response?.data?.message;
  const statusCode = err.response?.status;
  if (backendMsg) return `Error del servidor (${statusCode}): ${backendMsg}`;
  if (err.request && !err.response) {
    return 'No se pudo conectar con Laravel. Verifica que el backend esté corriendo (php artisan serve).';
  }
  return `Error inesperado: ${err.message}`;
};

/**
 * Trae categorías + productos de LA SUCURSAL DEL USUARIO LOGUEADO (el
 * backend resuelve el branch_id desde la sesión — ver GET /api/menu en
 * Admin\MenuController) y expone las acciones de mutación (disponibilidad,
 * duplicar, eliminar, reordenar) que la página de Menú necesita, para que
 * el componente de UI no hable con la API directo.
 *
 * Antes esta pantalla llamaba al endpoint PÚBLICO con un código de
 * sucursal fijo (`SUC-001` "quemado" en el código) — si el código de esa
 * sucursal cambiaba, o si el admin logueado pertenecía a otra sucursal,
 * la pantalla simplemente dejaba de funcionar. Ahora no depende de
 * ningún código: siempre trae el menú de la sucursal real del usuario.
 */
export default function useMenu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminMenu();
      if (!res.data.status) {
        setError(res.data.message || 'Error del servidor');
        return;
      }
      const cats = res.data.data.categories || [];
      setCategories(cats);
      const allProducts = cats.flatMap(
        (cat) => (cat.products || []).map((p) => ({ ...p, categoryName: cat.name }))
      );
      setProducts(allProducts);
    } catch (err) {
      console.error(err);
      setError(buildErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const toggleAvailability = async (id, currentlyAvailable) => {
    try {
      await api.put(`/products/${id}`, { is_available: !currentlyAvailable });
      fetchMenu();
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchMenu();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const duplicateProduct = async (id) => {
    try {
      await api.post(`/products/${id}/duplicate`);
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al duplicar el producto');
    }
  };

  /** Reordena los productos de una misma categoría vía drag & drop. */
  const reorderProducts = async (categoryId, draggedId, targetId) => {
    const categoryProducts = products.filter((p) => p.category_id === categoryId);
    const otherProducts = products.filter((p) => p.category_id !== categoryId);

    const fromIndex = categoryProducts.findIndex((p) => p.id === draggedId);
    const toIndex = categoryProducts.findIndex((p) => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...categoryProducts];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setProducts([...otherProducts, ...reordered]);

    try {
      await api.post('/products/reorder', {
        items: reordered.map((p, idx) => ({ id: p.id, sort_order: idx })),
      });
    } catch (err) {
      alert('Error al guardar el nuevo orden');
      fetchMenu();
    }
  };

  return {
    categories,
    products,
    loading,
    error,
    refetch: fetchMenu,
    toggleAvailability,
    deleteProduct,
    duplicateProduct,
    reorderProducts,
  };
}
