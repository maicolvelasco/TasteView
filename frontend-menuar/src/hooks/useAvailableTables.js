import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Busca mesas disponibles cada vez que cambian fecha, hora o comensales
 * (con los valores ya actualizados, no los del render anterior — antes esto
 * se disparaba a mano dentro de cada onChange del formulario y usaba datos
 * viejos, por eso casi nunca aparecían mesas disponibles). Se cancela la
 * carga en curso si los parámetros cambian antes de que responda el server.
 *
 * IMPORTANTE: antes cualquier error de la petición (por ejemplo un 422 de
 * validación del backend) se tragaba en silencio y dejaba `tables` en []
 * — indistinguible de "de verdad no hay mesas disponibles". Ahora se
 * expone `error` para poder diferenciar ambos casos en la UI.
 */
export default function useAvailableTables({ date, time, guests, branchId = 1 }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date || !time || !guests) {
      setTables([]);
      setError('');
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');

    api
      .get('/reservations/available-tables', {
        params: {
          branch_id: branchId,
          date,
          // El backend exige "H:i" estricto (date_format:H:i). Si el navegador
          // llega a mandar segundos ("14:30:00"), lo recortamos aquí para que
          // la validación no falle de forma silenciosa.
          time: time.slice(0, 5),
          guests: Number(guests),
        },
      })
      .then((res) => {
        if (active) setTables(res.data.data || []);
      })
      .catch((err) => {
        if (!active) return;
        setTables([]);
        // Mostramos el mensaje real del backend (ej. un error de
        // validación) en vez de disfrazarlo de "no hay mesas disponibles".
        const backendMessage = err.response?.data?.message;
        const validationErrors = err.response?.data?.errors;
        const firstValidationError = validationErrors
          ? Object.values(validationErrors)[0]?.[0]
          : null;
        setError(firstValidationError || backendMessage || 'No se pudo consultar la disponibilidad de mesas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [date, time, guests, branchId]);

  return { tables, loading, error };
}
