import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Trae las reservas de la sucursal y expone las acciones de mutación que la
 * página de Reservas necesita (crear, cambiar estado). La disponibilidad de
 * mesas para el formulario vive aparte, en hooks/useAvailableTables.js.
 *
 * Antes, al crear una reserva, se mandaba siempre `branch_id: 1` fijo (una
 * constante de módulo) — el mismo bug que ya se corrigió en el resto del
 * panel. El backend YA rechazaba esto correctamente para cualquier no-admin
 * de otra sucursal (403 "No tienes permiso..."), pero para un Admin lo
 * dejaba pasar y la reserva terminaba silenciosamente en la sucursal 1.
 * Ahora usa la sucursal real de la sesión.
 */
export default function useReservations() {
  const { user } = useAuth();
  const branchId = user?.branch?.id ?? null;

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
    await api.post('/reservations', { ...form, branch_id: branchId });
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
