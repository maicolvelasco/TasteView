/**
 * utils/branches.js
 * Helpers puros para la gestión de sucursales (sin dependencias de React).
 * Se pueden testear con datos simples, sin montar componentes.
 */

// ─── Tabs de estado ─────────────────────────────────────────────────────────

/**
 * Tabs fijos del TabSwitcher de la vista de Sucursales.
 * `trashed` solo se agrega si el usuario puede verla (Super Admin).
 * @param {boolean} canSeeTrashed
 */
export function buildBranchStatusFilters(canSeeTrashed) {
  const base = [
    { key: 'all', label: 'Todas' },
    { key: 'active', label: 'Activas' },
    { key: 'inactive', label: 'Inactivas' },
  ];
  if (canSeeTrashed) {
    base.push({ key: 'trashed', label: 'Papelera' });
  }
  return base;
}

// ─── Filtrado de lista ──────────────────────────────────────────────────────

/**
 * Filtra la lista de sucursales por término de búsqueda y estado.
 * @param {Array} branches
 * @param {string} searchTerm
 * @param {string} statusFilter  'all' | 'active' | 'inactive' (trashed se
 *   resuelve por fuera, trayendo la lista de la papelera desde la API)
 * @returns {Array}
 */
export function filterBranches(branches, searchTerm, statusFilter) {
  const term = searchTerm.trim().toLowerCase();
  return branches.filter((b) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && b.is_active) ||
      (statusFilter === 'inactive' && !b.is_active);

    const matchesSearch =
      !term ||
      b.name?.toLowerCase().includes(term) ||
      b.code?.toLowerCase().includes(term) ||
      b.address?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });
}

// ─── Avatar / identidad visual ──────────────────────────────────────────────

/** Misma paleta corporativa usada en utils/users.js, para que avatares de
 * usuarios y de sucursales se sientan parte del mismo sistema visual. */
const AVATAR_COLORS = [
  'var(--color-primary)',
  'var(--color-info)',
  'var(--color-success)',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#14B8A6',
];

/**
 * Genera un color de fondo determinístico para el avatar de una sucursal
 * a partir de su código.
 * @param {string} code
 * @returns {string} valor CSS de color
 */
export function getBranchAvatarColor(code = '') {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Estadísticas de la cabecera ────────────────────────────────────────────

export function buildBranchStats(branches) {
  return {
    total: branches.length,
    active: branches.filter((b) => b.is_active).length,
    inactive: branches.filter((b) => !b.is_active).length,
    usersTotal: branches.reduce((sum, b) => sum + (b.stats?.users_count || 0), 0),
  };
}

// ─── Opciones de formulario ─────────────────────────────────────────────────

/** Zonas horarias más usadas en Latinoamérica + un par de referencias
 * globales. Lista curada a propósito (en vez de las ~400 de la IANA)
 * para que el select sea usable en un formulario real. */
export const TIMEZONE_OPTIONS = [
  { value: 'America/La_Paz', label: 'La Paz / Bolivia (GMT-4)' },
  { value: 'America/Lima', label: 'Lima / Perú (GMT-5)' },
  { value: 'America/Bogota', label: 'Bogotá / Colombia (GMT-5)' },
  { value: 'America/Santiago', label: 'Santiago / Chile (GMT-3/4)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires / Argentina (GMT-3)' },
  { value: 'America/Asuncion', label: 'Asunción / Paraguay (GMT-3/4)' },
  { value: 'America/Montevideo', label: 'Montevideo / Uruguay (GMT-3)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5/4)' },
  { value: 'Europe/Madrid', label: 'Madrid / España (GMT+1/2)' },
  { value: 'UTC', label: 'UTC' },
];

/** Monedas más comunes para un negocio gastronómico en la región. */
export const CURRENCY_OPTIONS = [
  { value: 'BOB', label: 'Boliviano (BOB)' },
  { value: 'USD', label: 'Dólar estadounidense (USD)' },
  { value: 'PEN', label: 'Sol peruano (PEN)' },
  { value: 'COP', label: 'Peso colombiano (COP)' },
  { value: 'CLP', label: 'Peso chileno (CLP)' },
  { value: 'ARS', label: 'Peso argentino (ARS)' },
  { value: 'PYG', label: 'Guaraní paraguayo (PYG)' },
  { value: 'UYU', label: 'Peso uruguayo (UYU)' },
  { value: 'MXN', label: 'Peso mexicano (MXN)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

/** Estado inicial del formulario de sucursal (creación). */
export const EMPTY_BRANCH_FORM = {
  name: '',
  code: '',
  address: '',
  phone: '',
  timezone: 'America/La_Paz',
  currency: 'BOB',
  tax_rate: 13,
  is_active: true,
  settings: {
    receipt_header: '',
    receipt_footer: '',
  },
};
