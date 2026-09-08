import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Loader2, RotateCcw } from 'lucide-react';
import ImageUploadButton from '../ImageUploadButton';
import BrandLogo from '../layout/BrandLogo';
import useCompanySettings from '../../hooks/useCompanySettings';
import '../../pages/Admin/MenuPage.css'; // estilos de ImageUploadButton (.image-upload-*)

/**
 * Pestaña "Negocio" de Ajustes: permite reemplazar el branding genérico
 * del proyecto ("🍽️ Restaurant AR") por el logo y nombre reales del
 * negocio. El cambio se aplica de inmediato en: la topbar/drawer del
 * panel, el favicon de la pestaña del navegador, y el encabezado del
 * menú público — sin tocar código, todo desde acá.
 */
const BusinessSettingsForm = () => {
  const { company, loading, error, saving, save, refetch } = useCompanySettings();

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [formError, setFormError] = useState('');

  // Precarga el formulario apenas llega la empresa (y si se refresca).
  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setLogoUrl(company.logo_url || '');
    }
  }, [company]);

  const isDirty = company && (name !== (company.name || '') || logoUrl !== (company.logo_url || ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSavedAt(null);
    try {
      await save({ name: name.trim(), logo_url: logoUrl || null });
      setSavedAt(Date.now());
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={28} className="page-loading-spinner" />
        <p>Cargando ajustes del negocio...</p>
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
    <form className="settings-business-form" onSubmit={handleSubmit}>
      {/* ── Vista previa en vivo ── */}
      <div className="settings-preview-card">
        <span className="settings-preview-label">Así se va a ver</span>
        <div className="settings-preview-brand">
          <BrandLogo company={{ name, logo_url: logoUrl }} size={26} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="business-name">Nombre del negocio</label>
        <input
          id="business-name"
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Restaurant AR"
          maxLength={150}
          required
        />
        <p className="settings-field-hint">
          Se muestra en el panel de administración y como título del menú público
          (reemplaza "Sucursal Principal").
        </p>
      </div>

      <ImageUploadButton value={logoUrl} onChange={setLogoUrl} label="Logo del negocio" />
      <p className="settings-field-hint">
        Se redimensiona automáticamente para encajar en cada lugar donde aparece
        (topbar, menú público, ícono de la pestaña del navegador) — sube la imagen
        con la mejor calidad que tengas, sin preocuparte por el tamaño exacto.
      </p>

      <div className="settings-form-actions">
        <button type="submit" className="form-submit-btn" disabled={!isDirty || saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
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

export default BusinessSettingsForm;
