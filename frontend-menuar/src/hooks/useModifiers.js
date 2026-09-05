import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const buildErrorMessage = (err, fallback) => {
  const msg = err.response?.data?.message;
  return msg ? `Error del servidor: ${msg}` : fallback;
};

/**
 * Trae los grupos de opciones/modificadores (ej: "Tipo de bebida") y expone
 * las acciones de mutación que la página de Modificadores necesita.
 */
export default function useModifiers() {
  const [modifiers, setModifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchModifiers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/modifiers');
      if (res.data.status) setModifiers(res.data.data || []);
    } catch (err) {
      setError(buildErrorMessage(err, 'No se pudieron cargar las opciones.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModifiers();
  }, [fetchModifiers]);

  const createGroup = async (form) => {
    await api.post('/modifiers', { branch_id: 1, ...form });
    fetchModifiers();
  };

  const deleteGroup = async (id) => {
    if (!window.confirm('¿Eliminar este grupo de opciones? Se quitará de todos los productos que lo usen.')) return;
    try {
      await api.delete(`/modifiers/${id}`);
      fetchModifiers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el grupo de opciones');
    }
  };

  return { modifiers, loading, error, refetch: fetchModifiers, createGroup, deleteGroup };
}
