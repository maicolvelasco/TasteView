import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Trae los pedidos del mesero autenticado (el backend ya filtra por el
 * usuario logueado) para la pestaña "Mis Pedidos" de WaiterPage.
 */
export default function useWaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchOrders = useCallback(() => {
    setFetching(true);
    return api
      .get('/orders')
      .then((res) => setOrders(res.data.data?.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, fetching, refetch: fetchOrders };
}
