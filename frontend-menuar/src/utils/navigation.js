// Lógica pura de armado de navegación: no importa React ni JSX a propósito,
// así se puede testear con datos simples y no depende de la librería de íconos.

export const NAV_ICON = {
  ORDER: 'clipboardList',
  KITCHEN: 'chefHat',
  CASHIER: 'wallet',
  DASHBOARD: 'layoutDashboard',
  MENU: 'utensils',
  CATEGORIES: 'folderTree',
  MODIFIERS: 'sliders',
  TABLES: 'armchair',
  RESERVATIONS: 'calendarCheck',
  OPERATIONS: 'building',
  REPORTS: 'barChart',
  USERS: 'users',
  BRANCHES: 'store',
  SETTINGS: 'settings',
  USER_PROFILE: 'userProfile',
  BUSINESS: 'building',
};

/**
 * Arma el árbol de navegación (links sueltos + grupos con submenú) según
 * los roles del usuario. Los ítems relacionados quedan agrupados para no
 * mostrar una lista plana de 8+ opciones sueltas.
 */
export function buildNavItems({ isWaiter, isChef, isCashier, isManager, isAdmin }) {
  const items = [];

  if (isWaiter) items.push({ type: 'link', path: '/waiter', icon: NAV_ICON.ORDER, label: 'Tomar Pedido' });
  if (isChef) items.push({ type: 'link', path: '/kitchen', icon: NAV_ICON.KITCHEN, label: 'Cocina' });
  if (isCashier) items.push({ type: 'link', path: '/cashier', icon: NAV_ICON.CASHIER, label: 'Caja' });

  if (isManager) {
    items.push({ type: 'link', path: '/admin/dashboard', icon: NAV_ICON.DASHBOARD, label: 'Dashboard' });

    items.push({
      type: 'group',
      key: 'menu',
      icon: NAV_ICON.MENU,
      label: 'Menú',
      items: [
        { path: '/admin/menu', icon: NAV_ICON.MENU, label: 'Gestionar Menú' },
        { path: '/admin/categories', icon: NAV_ICON.CATEGORIES, label: 'Categorías' },
        { path: '/admin/modifiers', icon: NAV_ICON.MODIFIERS, label: 'Modificadores' },
      ],
    });

    items.push({
      type: 'group',
      key: 'operacion',
      icon: NAV_ICON.OPERATIONS,
      label: 'Operación',
      items: [
        { path: '/admin/tables', icon: NAV_ICON.TABLES, label: 'Mesas' },
        { path: '/admin/reservations', icon: NAV_ICON.RESERVATIONS, label: 'Reservas' },
      ],
    });

    items.push({ type: 'link', path: '/admin/reports', icon: NAV_ICON.REPORTS, label: 'Reportes' });
  }

  if (isAdmin) {
    items.push({ type: 'link', path: '/admin/users', icon: NAV_ICON.USERS, label: 'Usuarios' });
  }

  // Ajustes va al final del menú (convención habitual), como submenú
  // desplegable — igual que "Menú" agrupa Gestionar Menú/Categorías/
  // Modificadores. "Usuario" (perfil propio) es para Manager+; "Sucursales"
  // y "Negocio" solo para Admin+ (decisiones a nivel empresa).
  if (isManager) {
    const settingsItems = [
      { path: '/admin/settings/user', icon: NAV_ICON.USER_PROFILE, label: 'Usuario' },
    ];

    if (isAdmin) {
      settingsItems.push({ path: '/admin/branches', icon: NAV_ICON.BRANCHES, label: 'Sucursales' });
      settingsItems.push({ path: '/admin/settings/business', icon: NAV_ICON.BUSINESS, label: 'Negocio' });
    }

    items.push({
      type: 'group',
      key: 'ajustes',
      icon: NAV_ICON.SETTINGS,
      label: 'Ajustes',
      items: settingsItems,
    });
  }

  return items;
}

export function isPathActive(pathname, path) {
  return pathname.startsWith(path);
}

export function isGroupActive(pathname, group) {
  return group.items.some((item) => isPathActive(pathname, item.path));
}