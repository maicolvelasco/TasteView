// ─── Tema de colores del sistema (Ajustes > Negocio > Colores) ────────────
//
// El admin elige 1 color (modo "Sólido") o 2 colores (modo "Bicolor").
// A partir de eso se generan TODAS las variables derivadas que ya usa el
// resto de la app (hover, activo, fondo suave, borde suave) — el admin
// nunca tiene que pensar en esos matices, solo elige el/los color(es)
// base y acá se calculan matemáticamente.

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6})$/;

export function isValidHex(value) {
  return typeof value === 'string' && HEX_COLOR_REGEX.test(value);
}

export const DEFAULT_THEME = { mode: 'solid', primary: '#E67E22', secondary: null, font: 'inter' };

/** Paleta de sugerencias rápidas para no obligar a nadie a saber de códigos hex. */
export const PRESET_COLORS = [
  '#E67E22', // naranja (default del proyecto)
  '#DC2626', // rojo
  '#D946EF', // fucsia
  '#8B5CF6', // violeta
  '#3B82F6', // azul
  '#0EA5E9', // celeste
  '#10B981', // verde esmeralda
  '#65A30D', // verde oliva
  '#F59E0B', // ámbar
  '#78716C', // grafito
  '#1E293B', // azul marino oscuro
  '#111827', // casi negro
];

// ─── Tipografía del sistema (Ajustes > Negocio > Colores) ─────────────────
//
// Catálogo cerrado de fuentes profesionales de Google Fonts (no texto
// libre): así nunca se rompe la tipografía por un nombre mal escrito, y
// cada opción se puede previsualizar en su propia fuente en el selector.
export const FONT_OPTIONS = [
  { key: 'inter', label: 'Inter (por defecto)', family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", googleFont: 'Inter:wght@400;500;600;700;800' },
  { key: 'poppins', label: 'Poppins', family: "'Poppins', sans-serif", googleFont: 'Poppins:wght@400;500;600;700;800' },
  { key: 'roboto', label: 'Roboto', family: "'Roboto', sans-serif", googleFont: 'Roboto:wght@400;500;700;900' },
  { key: 'nunito', label: 'Nunito', family: "'Nunito', sans-serif", googleFont: 'Nunito:wght@400;600;700;800' },
  { key: 'montserrat', label: 'Montserrat', family: "'Montserrat', sans-serif", googleFont: 'Montserrat:wght@400;500;600;700;800' },
  { key: 'lato', label: 'Lato', family: "'Lato', sans-serif", googleFont: 'Lato:wght@400;700;900' },
  { key: 'workSans', label: 'Work Sans', family: "'Work Sans', sans-serif", googleFont: 'Work+Sans:wght@400;500;600;700;800' },
  { key: 'jakarta', label: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", googleFont: 'Plus+Jakarta+Sans:wght@400;500;600;700;800' },
  { key: 'outfit', label: 'Outfit', family: "'Outfit', sans-serif", googleFont: 'Outfit:wght@400;500;600;700;800' },
  { key: 'sourceSans', label: 'Source Sans 3', family: "'Source Sans 3', sans-serif", googleFont: 'Source+Sans+3:wght@400;600;700;800' },
];

export const DEFAULT_FONT_KEY = 'inter';

export function getFontOption(key) {
  return FONT_OPTIONS.find((f) => f.key === key) || FONT_OPTIONS[0];
}

/**
 * Carga la fuente elegida desde Google Fonts (si todavía no está
 * cargada) y la deja lista para usar. Reutiliza siempre el mismo
 * <link>, así cambiar de fuente varias veces no va dejando tags sueltos
 * en el <head>.
 */
function loadGoogleFont(fontOption) {
  if (!fontOption.googleFont) return;

  const linkId = 'theme-google-font';
  let link = document.getElementById(linkId);
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = `https://fonts.googleapis.com/css2?family=${fontOption.googleFont}&display=swap`;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Oscurece (percent > 0) o aclara (percent < 0) un color hex un % dado. */
function shade(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const amount = percent / 100;
  const mix = (channel) => (amount >= 0 ? channel * (1 - amount) : channel + (255 - channel) * -amount);
  return rgbToHex({ r: mix(r), g: mix(g), b: mix(b) });
}

function toRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Decide si el texto sobre este color debe ser blanco o negro, según su
 * luminancia — así un primario muy claro (ej. un amarillo pastel) no deja
 * texto blanco ilegible encima.
 */
export function readableTextColor(hex) {
  if (!isValidHex(hex)) return '#FFFFFF';
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
}

/**
 * Construye el mapa completo de variables CSS a partir de un tema
 * {mode, primary, secondary, font}. En modo bicolor, el segundo color se
 * usa como "punta" de los degradados de marca que YA existen en toda la
 * app (headers, botones principales, login, tarjetas destacadas) a
 * través de --color-gradient-end — así el bicolor se ve en todos lados
 * sin tener que tocar componente por componente.
 *
 * Los fondos y superficies (tarjetas, modales, bordes) también se
 * "tiñen" muy sutilmente con el color primario en vez de quedar en
 * blanco/gris neutro — así la marca se nota hasta en el fondo de un
 * modal, sin sacrificar legibilidad (el tinte es tan sutil que el texto
 * oscuro de siempre sigue leyéndose perfecto). Se deriva SIEMPRE del
 * primario, incluso en modo bicolor: mezclar dos tonos muy distintos
 * (ej. naranja + azul) para un fondo daría un gris "sucio", así que el
 * secundario se reserva para los degradados, no para las superficies.
 */
export function buildThemeVariables(theme) {
  const primary = isValidHex(theme?.primary) ? theme.primary : DEFAULT_THEME.primary;
  const isBicolor = theme?.mode === 'bicolor' && isValidHex(theme?.secondary);
  const secondary = isBicolor ? theme.secondary : null;
  const font = getFontOption(theme?.font);

  return {
    '--color-primary': primary,
    '--color-primary-hover': shade(primary, 12),
    '--color-primary-active': shade(primary, 20),
    '--color-primary-soft': toRgba(primary, 0.12),
    '--color-primary-soft-border': toRgba(primary, 0.35),
    '--color-text-on-primary': readableTextColor(primary),
    '--color-gradient-end': isBicolor ? secondary : shade(primary, 12),

    // Superficies con un tinte de marca muy sutil (2-20% de mezcla con
    // blanco, de menos a más notorio) en vez del blanco/gris neutro fijo.
    '--color-bg': shade(primary, -98.5),
    '--color-bg-secondary': shade(primary, -95),
    '--color-surface': shade(primary, -99),
    '--color-border': shade(primary, -90),
    '--color-border-strong': shade(primary, -82),

    '--font-family': font.family,
  };
}

const THEME_CSS_VARS = [
  '--color-primary',
  '--color-primary-hover',
  '--color-primary-active',
  '--color-primary-soft',
  '--color-primary-soft-border',
  '--color-text-on-primary',
  '--color-gradient-end',
  '--color-bg',
  '--color-bg-secondary',
  '--color-surface',
  '--color-border',
  '--color-border-strong',
  '--font-family',
];

/** Aplica el tema como variables CSS inline en <html>, sobreescribiendo los defaults de index.css al instante — sin recompilar nada. */
export function applyThemeVariables(theme) {
  const vars = buildThemeVariables(theme);
  const root = document.documentElement.style;
  Object.entries(vars).forEach(([key, value]) => root.setProperty(key, value));
  loadGoogleFont(getFontOption(theme?.font));
}

/** Quita el override inline y vuelve a los valores por defecto de index.css. */
export function resetThemeVariables() {
  const root = document.documentElement.style;
  THEME_CSS_VARS.forEach((key) => root.removeProperty(key));
}
