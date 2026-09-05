import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const BRANCH_ID = 1;

/**
 * Trae las reservas de la sucursal y expone las acciones de mutación que la
 * página de Reservas necesita (crear, cambiar estado). La disponibilidad de
 * mesas para el formulario vive aparte, en hooks/useAvailableTables.js.
 */
export default function useReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reservations');
      setReservations(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg ? `Error del servidor: ${msg}` : 'No se pudieron cargar las reservas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const createReservation = async (form) => {
    await api.post('/reservations', { ...form, branch_id: BRANCH_ID });
    fetchReservations();
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar la reserva');
    }
  };

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations,
    createReservation,
    updateStatus,
  };
}
