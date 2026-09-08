import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { getAdminMenu } from '../services/menu';
import { useAuth } from '../context/AuthContext';

/**
 * Trae las categorías de LA SUCURSAL DEL USUARIO LOGUEADO (con conteo de
 * productos) y expone las acciones de mutación que la página de
 * Categorías necesita.
 *
 * Antes esta pantalla tenía DOS bugs relacionados:
 *  1) Traía las categorías llamando al endpoint público con un código de
 *     sucursal fijo (`SUC-001` quemado en el código) — por eso una
 *     categoría de "otra sucursal que no es la principal" tiraba
 *     "Sucursal no encontrada": ese código simplemente no existía.
 *  2) Al CREAR una categoría nueva, mandaba siempre `branch_id: 1` fijo,
 *     sin importar en qué sucursal estuviera parado el admin — así que
 *     aunque hubieras arreglado el bug de lectura, las categorías nuevas
 *     se hubieran seguido creando en la sucursal 1 por error.
 * Ambos se resuelven usando siempre la sucursal real de la sesión.
 */
export default function useCategories() {
  const { user } = useAuth();
  const branchId = user?.branch?.id ?? null;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminMenu();
      if (res.data.status) {
        // Traemos también el conteo de productos por categoría, para avisar antes de borrar.
        const cats = (res.data.data.categories || []).map((c) => ({
          ...c,
          productCount: (c.products || []).length,
        }));
        setCategories(cats);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg ? `Error del servidor: ${msg}` : 'No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const saveCategory = async (form, editingCategory) => {
    if (editingCategory) {
      await api.put(`/categories/${editingCategory.id}`, form);
    } else {
      await api.post('/categories', { ...form, branch_id: branchId });
    }
    fetchCategories();
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category.id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la categoría');
    }
  };

  const reorderCategories = async (draggedId, targetId) => {
    const fromIndex = categories.findIndex((c) => c.id === draggedId);
    const toIndex = categories.findIndex((c) => c.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setCategories(reordered);

    try {
      await api.post('/categories/reorder', {
        items: reordered.map((c, idx) => ({ id: c.id, sort_order: idx })),
      });
    } catch (err) {
      alert('Error al guardar el nuevo orden');
      fetchCategories();
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    saveCategory,
    deleteCategory,
    reorderCategories,
  };
}
