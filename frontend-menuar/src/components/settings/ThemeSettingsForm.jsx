import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Loader2, RotateCcw } from 'lucide-react';
import useCompanySettings from '../../hooks/useCompanySettings';
import {
  DEFAULT_THEME, DEFAULT_FONT_KEY, FONT_OPTIONS, PRESET_COLORS,
  buildThemeVariables, getFontOption, isValidHex, readableTextColor,
} from '../../utils/theme';

/**
 * Sección "Colores del sistema" de Ajustes > Negocio: el admin elige 1
 * color (modo Sólido) o 2 colores (modo Bicolor) y una tipografía, y se
 * aplican de inmediato en TODO el sistema —panel de administración y
 * menú público— sin tocar código ni recompilar nada.
 *
 * En modo Bicolor, el segundo color se usa como "punta" de los
 * degradados de marca que ya existen en toda la app (headers, botones
 * principales, login) — por eso el bicolor se ve en todos lados con
 * solo elegir 2 colores acá. Los fondos/superficies (tarjetas, modales,
 * bordes) también se tiñen sutilmente con el primario, en vez de quedar
 * en blanco/gris neutro fijo.
 */
const ThemeSettingsForm = () => {
  const { company, loading, error, saving, save, refetch } = useCompanySettings();

  const [mode, setMode] = useState(DEFAULT_THEME.mode);
  const [primary, setPrimary] = useState(DEFAULT_THEME.primary);
  const [secondary, setSecondary] = useState('#3498DB');
  const [font, setFont] = useState(DEFAULT_FONT_KEY);
  const [savedAt, setSavedAt] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (company?.theme) {
      setMode(company.theme.mode || DEFAULT_THEME.mode);
      setPrimary(isValidHex(company.theme.primary) ? company.theme.primary : DEFAULT_THEME.primary);
      if (isValidHex(company.theme.secondary)) setSecondary(company.theme.secondary);
      setFont(getFontOption(company.theme.font).key);
    }
  }, [company]);

  const original = company?.theme;
  const isDirty = original && (
    mode !== (original.mode || DEFAULT_THEME.mode)
    || primary !== (original.primary || DEFAULT_THEME.primary)
    || font !== getFontOption(original.font).key
    || (mode === 'bicolor' && secondary !== (original.secondary || secondary))
  );

  const previewVars = buildThemeVariables({ mode, primary, secondary, font });

  const handleReset = () => {
    setMode(DEFAULT_THEME.mode);
    setPrimary(DEFAULT_THEME.primary);
    setFont(DEFAULT_FONT_KEY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSavedAt(null);
    try {
      await save({ theme: { mode, primary, secondary: mode === 'bicolor' ? secondary : null, font } });
      setSavedAt(Date.now());
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={28} className="page-loading-spinner" />
        <p>Cargando colores del sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <AlertTriangle size={28} />
        <p>{error}</p>
        <button type="button" className="page-retry-btn" onClick={refetch}>
          <RotateCcw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <form className="settings-theme-form" onSubmit={handleSubmit}>
      {/* ── Modo: Sólido / Bicolor ── */}
      <div className="form-field">
        <label>Modo de color</label>
        <div className="settings-mode-switch">
          <button
            type="button"
            className={`settings-mode-btn ${mode === 'solid' ? 'is-active' : ''}`}
            onClick={() => setMode('solid')}
          >
            Un solo color
          </button>
          <button
            type="button"
            className={`settings-mode-btn ${mode === 'bicolor' ? 'is-active' : ''}`}
            onClick={() => setMode('bicolor')}
          >
            Bicolor
          </button>
        </div>
        <p className="settings-field-hint">
          {mode === 'solid'
            ? 'Un solo color base; los tonos de hover, fondos suaves y bordes se calculan solos.'
            : 'Dos colores: el sistema los combina en degradados en encabezados, botones principales y el login.'}
        </p>
      </div>

      {/* ── Color primario ── */}
      <ColorField
        label={mode === 'bicolor' ? 'Color 1 (primario)' : 'Color del sistema'}
        value={primary}
        onChange={setPrimary}
      />

      {/* ── Color secundario (solo bicolor) ── */}
      {mode === 'bicolor' && (
        <ColorField label="Color 2 (secundario)" value={secondary} onChange={setSecondary} />
      )}

      {/* ── Tipografía ── */}
      <div className="form-field">
        <label htmlFor="theme-font">Tipografía</label>
        <select
          id="theme-font"
          className="input"
          value={font}
          onChange={(e) => setFont(e.target.value)}
          style={{ fontFamily: getFontOption(font).family }}
        >
          {FONT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key} style={{ fontFamily: opt.family }}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="settings-field-hint">Se aplica en todo el panel y el menú público.</p>
      </div>

      {/* ── Vista previa en vivo ── */}
      <div className="settings-preview-card" style={{ fontFamily: getFontOption(font).family }}>
        <span className="settings-preview-label">Así se va a ver</span>
        <div
          className="settings-theme-preview-bar"
          style={{
            background: mode === 'bicolor'
              ? `linear-gradient(135deg, ${primary}, ${secondary})`
              : `linear-gradient(135deg, ${primary}, ${previewVars['--color-gradient-end']})`,
            color: readableTextColor(primary),
          }}
        >
          Encabezado / botón principal
        </div>
        <div className="settings-theme-preview-row">
          <span
            className="settings-theme-preview-chip"
            style={{ background: previewVars['--color-primary-soft'], color: primary, border: `1px solid ${previewVars['--color-primary-soft-border']}` }}
          >
            Fondo suave
          </span>
          <span className="settings-theme-preview-swatch" style={{ background: primary }} title="Primario" />
          {mode === 'bicolor' && (
            <span className="settings-theme-preview-swatch" style={{ background: secondary }} title="Secundario" />
          )}
        </div>
        <div
          className="settings-theme-preview-surface"
          style={{ background: previewVars['--color-surface'], borderColor: previewVars['--color-border'] }}
        >
          Así se ve una tarjeta o un modal con este tema
        </div>
      </div>

      <div className="settings-form-actions">
        <button type="submit" className="form-submit-btn" disabled={!isDirty || saving}>
          {saving ? 'Guardando...' : 'Guardar colores'}
        </button>
        <button type="button" className="admin-new-btn admin-new-btn--secondary" onClick={handleReset}>
          Restaurar por defecto
        </button>
        {savedAt && !isDirty && (
          <span className="settings-saved-badge">
            <Check size={14} strokeWidth={2.5} /> Guardado
          </span>
        )}
      </div>

      {formError && <p className="settings-field-error">{formError}</p>}
    </form>
  );
};

/** Selector de color: swatch nativo + campo hex + paleta de sugerencias rápidas. */
const ColorField = ({ label, value, onChange }) => {
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => setHexInput(value), [value]);

  const commitHex = (raw) => {
    const candidate = raw.startsWith('#') ? raw : `#${raw}`;
    if (isValidHex(candidate)) onChange(candidate);
  };

  return (
    <div className="form-field">
      <label>{label}</label>
      <div className="settings-color-row">
        <input
          type="color"
          className="settings-color-swatch-input"
          value={isValidHex(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          className="input settings-color-hex-input"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={(e) => commitHex(e.target.value.trim())}
          placeholder="#E67E22"
          maxLength={7}
        />
      </div>
      <div className="settings-preset-row">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`settings-preset-swatch ${value?.toLowerCase() === preset.toLowerCase() ? 'is-selected' : ''}`}
            style={{ background: preset }}
            onClick={() => onChange(preset)}
            aria-label={`Usar color ${preset}`}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSettingsForm;
