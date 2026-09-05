import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { computeCashierStats } from '../utils/cashier';
import { openTicketWindow } from '../utils/ticket';

const EMPTY_INVOICE_FORM = { customer_name: '', customer_nit: '', has_tax: true, payment_method: 'cash' };

const buildErrorMessage = (err) => {
  const backendMsg = err.response?.data?.message;
  if (backendMsg) return backendMsg;
  if (err.request && !err.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
  }
  return 'Ocurrió un error inesperado al cargar la caja.';
};

/**
 * Centraliza todo el estado y las acciones de la pantalla de Caja (pedidos
 * por cobrar, facturación e historial), para que CashierPage.jsx solo se
 * encargue de componer la UI y no de hablar con la API directamente.
 */
export default function useCashier() {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedOrder, setSelectedOrderState] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_INVOICE_FORM);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const [ordersRes, invoicesRes] = await Promise.all([api.get('/orders'), api.get('/invoices')]);

      const all = ordersRes.data.data.data || [];
      // El cajero ve los pedidos apenas se generan (no espera a que cocina los
      // marque "listo"); solo se excluyen los ya facturados o cancelados.
      const receivable = all.filter((o) => (!o.invoice || o.invoice.status === 'cancelled') && o.status !== 'cancelled');

      setOrders(receivable);
      setInvoices(invoicesRes.data.data.data || []);
      setError('');
      setSelectedOrderState((prev) => (prev && !receivable.some((o) => o.id === prev.id) ? null : prev));
    } catch (err) {
      setError(buildErrorMessage(err));
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectOrder = useCallback((order) => {
    setSelectedOrderState(order);
    setInvoiceForm({
      customer_name: order.customer_name || '',
      customer_nit: '',
      has_tax: true,
      payment_method: 'cash',
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedOrderState(null);
    setInvoiceForm(EMPTY_INVOICE_FORM);
  }, []);

  const updateInvoiceField = useCallback((field, value) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Recibe el ID de la factura, pide el detalle completo (con el "ticket" ya
  // armado por el backend) y recién ahí abre la ventana de impresión.
  const printTicket = useCallback(async (invoiceId) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}`);
      const ticket = res.data.data?.ticket;
      if (!ticket) throw new Error('No se pudo obtener el detalle de la factura');
      openTicketWindow(ticket);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error al obtener el ticket');
    }
  }, []);

  const createInvoice = useCallback(async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      const res = await api.post('/invoices', { order_id: selectedOrder.id, ...invoiceForm });
      const newInvoiceId = res.data.data?.id;
      clearSelection();
      await fetchData();
      if (newInvoiceId) await printTicket(newInvoiceId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al emitir factura');
    } finally {
      setLoading(false);
    }
  }, [selectedOrder, invoiceForm, clearSelection, fetchData, printTicket]);

  const stats = useMemo(() => computeCashierStats(orders, invoices), [orders, invoices]);

  return {
    orders,
    invoices,
    selectedOrder,
    invoiceForm,
    activeTab,
    loading,
    fetching,
    error,
    stats,
    setActiveTab,
    selectOrder,
    clearSelection,
    updateInvoiceField,
    createInvoice,
    printTicket,
    refetch: fetchData,
  };
}
