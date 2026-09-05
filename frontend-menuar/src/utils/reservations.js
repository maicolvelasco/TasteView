// Lógica pura de reservas (sin React), usada por la página de Admin y sus
// componentes hijos. Mismo criterio que utils/orders.js: cada estado se
// traduce a un "tono" semántico de la paleta corporativa (index.css).

export const RESERVATION_STATUS_THEME = {
  pending: 'warning',
  confirmed: 'info',
  seated: 'success',
  cancelled: 'error',
  no_show: 'neutral',
};

export const RESERVATION_STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  seated: 'Sentada',
  cancelled: 'Cancelada',
  no_show: 'No Show',
};

// Pestañas de filtro de la barra superior (TabSwitcher).
export const RESERVATION_STATUS_FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'seated', label: 'Sentadas' },
  { key: 'cancelled', label: 'Canceladas' },
];

/** Fecha corta en español boliviano: "vie, 12 sep". */
export function formatReservationDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('es-BO', { weekday: 'short', day: '2-digit', month: 'short' });
}

/** Hora "HH:MM", tolerante a que el backend devuelva segundos. */
export function formatReservationTime(timeString) {
  if (!timeString) return '-';
  return timeString.slice(0, 5);
}

/** true si la fecha de la reserva es hoy (fecha local del navegador). */
export function isReservationToday(dateString) {
  if (!dateString) return false;
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return dateString === localToday;
}
