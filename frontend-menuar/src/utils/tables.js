// Lógica pura del estado de mesas (sin React). Mismo criterio que
// utils/reservations.js / utils/orders.js: cada estado se traduce a un
// "tono" semántico de la paleta corporativa (index.css).

export const TABLE_STATUS_THEME = {
  free: 'success',
  occupied: 'error',
  reserved: 'warning',
  cleaning: 'info',
};

export const TABLE_STATUS_LABELS = {
  free: 'Libre',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'Limpieza',
};

// Pestañas de filtro de la barra superior (TabSwitcher).
export const TABLE_STATUS_FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'free', label: 'Libres' },
  { key: 'occupied', label: 'Ocupadas' },
  { key: 'reserved', label: 'Reservadas' },
  { key: 'cleaning', label: 'Limpieza' },
];
