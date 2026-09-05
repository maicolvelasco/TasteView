import { useCallback, useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/dashboard';
import { getSales, getTopProducts } from '../services/reports';

/**
 * Gestiona el estado y la carga de datos del Dashboard.
 * El resumen principal (/dashboard) es obligatorio para renderizar la
 * pantalla; la tendencia semanal y el top de productos son complementarios
 * y se piden en paralelo — si fallan, el panel igual se muestra con lo
 * esencial en vez de bloquearse por completo.
 */
export default function useDashboard() {
  const [stats, setStats]             = useState(null);
  const [salesTrend, setSalesTrend]   = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const summaryRes = await getDashboardSummary();
      setStats(summaryRes.data.data);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg
          ? `Error del servidor: ${msg}`
          : 'No se pudo cargar el panel. Verifica la conexión con el servidor.',
      );
      setLoading(false);
      return;
    }

    // Datos complementarios: no bloquean el panel principal si fallan.
    const [salesRes, topRes] = await Promise.allSettled([
      getSales('week'),
      getTopProducts(5),
    ]);
    if (salesRes.status === 'fulfilled') setSalesTrend(salesRes.value.data.data || []);
    if (topRes.status === 'fulfilled') setTopProducts(topRes.value.data.data || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    salesTrend,
    topProducts,
    loading,
    error,
    refetch: fetchData,
  };
}
