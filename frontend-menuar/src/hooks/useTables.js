import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Trae las mesas de la sucursal y expone las acciones de mutación que la
 * página de Mesas necesita (crear/editar, cambiar estado, eliminar).
 */
export default function useTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg ? `Error del servidor: ${msg}` : 'No se pudieron cargar las mesas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const saveTable = async (form, editingTable) => {
    if (editingTable) {
      await api.put(`/tables/${editingTable.id}`, form);
    } else {
      await api.post('/tables', form);
    }
    fetchTables();
  };

  const changeStatus = async (table, status) => {
    try {
      await api.put(`/tables/${table.id}`, { status });
      fetchTables();
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  const deleteTable = async (table) => {
    if (!window.confirm(`¿Quitar la mesa "${table.number}"?`)) return;
    try {
      const res = await api.delete(`/tables/${table.id}`);
      if (res.data.message) {
        // Puede haberse desactivado en vez de eliminado (si tiene historial de pedidos).
        alert(res.data.message);
      }
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la mesa');
    }
  };

  return {
    tables,
    loading,
    error,
    refetch: fetchTables,
    saveTable,
    changeStatus,
    deleteTable,
  };
}
