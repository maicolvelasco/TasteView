import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const BRANCH_CODE = 'SUC-001';

/**
 * Trae las categorías de la sucursal (con conteo de productos) y expone las
 * acciones de mutación que la página de Categorías necesita.
 */
export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/menu/${BRANCH_CODE}`);
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
      await api.post('/categories', { ...form, branch_id: 1 });
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
