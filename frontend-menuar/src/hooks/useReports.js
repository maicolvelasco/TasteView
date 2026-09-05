import { useCallback, useEffect, useState } from 'react';
import { getSales, getTopProducts, getSummary } from '../services/reports';

/**
 * Gestiona el estado y la carga de datos de la pantalla de Reportes.
 * Cuando `period` cambia, se vuelven a pedir automáticamente las ventas.
 */
export default function useReports() {
  const [period, setPeriod]           = useState('week');
  const [salesData, setSalesData]     = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // ─── Fetch completo ─────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [salesRes, topRes, summaryRes] = await Promise.all([
        getSales(period),
        getTopProducts(8),
        getSummary(),
      ]);
      setSalesData(salesRes.data.data || []);
      setTopProducts(topRes.data.data || []);
      setSummary(summaryRes.data.data);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg
          ? `Error del servidor: ${msg}`
          : 'No se pudieron cargar los reportes. Verifica la conexión con el servidor.',
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    period,
    setPeriod,
    salesData,
    topProducts,
    summary,
    loading,
    error,
    refetch: fetchData,
  };
}
