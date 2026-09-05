/**
 * utils/users.js
 * Helpers puros para la gestión de usuarios (sin dependencias de React).
 * Se pueden testear con datos simples, sin montar componentes.
 */

// ─── Filtros de pestaña ────────────────────────────────────────────────────

/**
 * Genera los tabs del TabSwitcher a partir de los roles disponibles.
 * Siempre incluye "Todos" como primera opción.
 * @param {Array<{id: number|string, name: string}>} roles
 * @returns {Array<{key: string, label: string}>}
 */
export function buildUserRoleFilters(roles) {
  const base = [{ key: 'all', label: 'Todos' }];
  const roleFilters = roles.map((r) => ({ key: String(r.id), label: r.name }));
  return [...base, ...roleFilters];
}

// ─── Tonos de Badge por rol ────────────────────────────────────────────────

/**
 * Mapea el nombre del rol a un tono semántico del Badge corporativo.
 * Los tonos disponibles son: primary | success | info | warning | error | neutral.
 */
const ROLE_TONE_MAP = {
  'Super Administrador': 'error',
  'super_admin': 'error',
  'Administrador': 'primary',
  'admin': 'primary',
  'Gerente': 'warning',
  'manager': 'warning',
  'Cajero': 'info',
  'cashier': 'info',
  'Chef': 'success',
  'chef': 'success',
  'Mesero': 'neutral',
  'waiter': 'neutral',
};

/**
 * Devuelve el tono de Badge correspondiente al nombre o slug del rol.
 * Si no está en el mapa devuelve 'neutral'.
 * @param {string} roleNameOrSlug
 * @returns {string}
 */
export function getUserRoleTone(roleNameOrSlug) {
  return ROLE_TONE_MAP[roleNameOrSlug] ?? 'neutral';
}

// ─── Avatar ───────────────────────────────────────────────────────────────

/**
 * Extrae hasta 2 iniciales del nombre completo.
 * "Juan Carlos Pérez" → "JP"  /  "Ana" → "A"
 * @param {string} name
 * @returns {string}
 */
export function getUserInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Genera un color de fondo determinístico para el avatar a partir
 * del nombre del usuario (basado en su hashcode).
 * Usa la paleta corporativa de la aplicación.
 * @param {string} name
 * @returns {string}  valor CSS de color
 */
const AVATAR_COLORS = [
  'var(--color-primary)',
  'var(--color-info)',
  'var(--color-success)',
  '#8B5CF6',  // violeta
  '#EC4899',  // rosa
  '#F59E0B',  // ámbar
  '#14B8A6',  // teal
];

export function getUserAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Filtrado de lista ─────────────────────────────────────────────────────

/**
 * Filtra la lista de usuarios por término de búsqueda y rol seleccionado.
 * @param {Array} users
 * @param {string} searchTerm
 * @param {string} roleFilter  'all' o el id del rol como string
 * @returns {Array}
 */
export function filterUsers(users, searchTerm, roleFilter) {
  const term = searchTerm.trim().toLowerCase();
  return users.filter((u) => {
    const matchesRole = roleFilter === 'all' || String(u.role?.id) === roleFilter;
    const matchesSearch =
      !term ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });
}
