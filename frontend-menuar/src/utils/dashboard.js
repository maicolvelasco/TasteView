// Lógica pura de la pantalla de Dashboard: saludo según la hora, formato de
// fecha y armado de accesos rápidos. Sin JSX a propósito (mismo criterio que
// utils/navigation.js) para poder testear sin depender de React ni íconos.

/** Saludo contextual según la hora del día. */
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Fecha larga en español boliviano, ej. "martes, 2 de septiembre de 2026". */
export function formatLongDate(date = new Date()) {
  const text = date.toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Hora corta, ej. "14:32". */
export function formatShortTime(date = new Date()) {
  return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Porcentaje de ocupación de mesas (0-100), a salvo de división por cero.
 * Se usa para el anillo del widget de estado de mesas.
 */
export function getOccupancyPct(occupied = 0, free = 0) {
  const total = occupied + free;
  if (total <= 0) return 0;
  return Math.round((occupied / total) * 100);
}

/**
 * Accesos rápidos del panel administrativo. `minLevel` reutiliza el mismo
 * criterio de nivel de rol que App.jsx/ProtectedRoute; `adminOnly` filtra el
 * único ítem exclusivo de administrador (Usuarios).
 * Las claves de `icon` son las de src/icons/index.jsx (NavIcon), así el
 * ícono cambia en un solo lugar si el sistema de íconos cambia a futuro.
 */
export const DASHBOARD_QUICK_ACTIONS = [
  { path: '/admin/menu', icon: 'utensils', label: 'Gestionar Menú', description: 'Productos y precios', adminOnly: false },
  { path: '/admin/categories', icon: 'folderTree', label: 'Categorías', description: 'Organiza el catálogo', adminOnly: false },
  { path: '/admin/modifiers', icon: 'sliders', label: 'Modificadores', description: 'Opciones y extras', adminOnly: false },
  { path: '/admin/tables', icon: 'armchair', label: 'Mesas', description: 'Distribución del salón', adminOnly: false },
  { path: '/admin/reservations', icon: 'calendarCheck', label: 'Reservas', description: 'Agenda de clientes', adminOnly: false },
  { path: '/admin/reports', icon: 'barChart', label: 'Reportes', description: 'Ventas y tendencias', adminOnly: false },
  { path: '/admin/users', icon: 'users', label: 'Usuarios', description: 'Equipo y accesos', adminOnly: true },
];

export function buildQuickActions({ isAdmin }) {
  return DASHBOARD_QUICK_ACTIONS.filter((action) => !action.adminOnly || isAdmin);
}
