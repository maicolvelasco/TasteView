// Utilidades específicas de Caja. Sin JSX/React a propósito (mismo criterio
// que utils/navigation.js): lógica pura, fácil de testear y de reutilizar.

// Métodos de pago disponibles al emitir una factura. `icon` es una clave de
// texto (no un componente) que components/cashier/PaymentMethodPicker.jsx
// traduce al ícono real, igual que hace icons/index.jsx con la navegación.
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo', icon: 'banknote' },
  { value: 'card', label: 'Tarjeta', icon: 'creditCard' },
  { value: 'transfer', label: 'Transferencia', icon: 'landmark' },
  { value: 'qr', label: 'QR', icon: 'qrCode' },
];

/**
 * Resume pedidos por cobrar y facturas emitidas para las tarjetas de
 * estadísticas del encabezado de Caja.
 */
export function computeCashierStats(orders, invoices) {
  const today = new Date().toDateString();
  const invoicesToday = invoices.filter(
    (inv) => inv.status !== 'cancelled' && new Date(inv.created_at).toDateString() === today
  );

  return {
    pendingCount: orders.length,
    pendingTotal: orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    invoicesTodayCount: invoicesToday.length,
    revenueToday: invoicesToday.reduce((sum, inv) => sum + Number(inv.total || 0), 0),
    totalInvoices: invoices.length,
  };
}
