// Niveles de rol
export const ROLE_LEVELS = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  MANAGER: 70,
  CASHIER: 50,
  CHEF: 40,
  WAITER: 30,
  CUSTOMER: 10,
};

// Colores por estado de pedido
export const ORDER_STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  in_preparation: '#8b5cf6',
  ready: '#10b981',
  served: '#059669',
  cancelled: '#ef4444',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En preparación',
  ready: 'Listo',
  served: 'Servido',
  cancelled: 'Cancelado',
};

// Formatear moneda
export const formatCurrency = (amount, currency = 'BOB') => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
