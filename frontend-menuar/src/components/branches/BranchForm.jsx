import React, { useState } from 'react';
import {
  Store, Save, Hash, MapPin, Phone, Clock, Coins,
  Percent, CheckSquare, Receipt, ChevronDown,
} from 'lucide-react';
import { TIMEZONE_OPTIONS, CURRENCY_OPTIONS, EMPTY_BRANCH_FORM } from '../../utils/branches';

/**
 * Formulario de creación/edición de sucursales.
 * Recibe `initialData` (vacío para crear, o datos de la sucursal a
 * editar) y llama a `onSave(formData)` al enviar. El modal que lo
 * contiene (FormModal) gestiona el overlay y el cierre.
 */
const BranchForm = ({ initialData, onSave, saving = false }) => {
  const [form, setForm] = useState({
    name: initialData?.name ?? EMPTY_BRANCH_FORM.name,
    code: initialData?.code ?? EMPTY_BRANCH_FORM.code,
    address: initialData?.address ?? EMPTY_BRANCH_FORM.address,
    phone: initialData?.phone ?? EMPTY_BRANCH_FORM.phone,
    timezone: initialData?.timezone ?? EMPTY_BRANCH_FORM.timezone,
    currency: initialData?.currency ?? EMPTY_BRANCH_FORM.currency,
    tax_rate: initialData?.tax_rate ?? EMPTY_BRANCH_FORM.tax_rate,
    is_active: initialData?.is_active ?? EMPTY_BRANCH_FORM.is_active,
    settings: {
      receipt_header: initialData?.settings?.receipt_header ?? '',
      receipt_footer: initialData?.settings?.receipt_footer ?? '',
    },
  });

  const [showReceiptSettings, setShowReceiptSettings] = useState(false);

  const isEditing = Boolean(initialData?.id);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setSetting = (field) => (e) =>
    setForm((prev) => ({ ...prev, settings: { ...prev.settings, [field]: e.target.value } }));

  const handleCodeChange = (e) => {
    // El backend normaliza el código a mayúsculas de todas formas; se
    // refleja en vivo para que el usuario vea el valor real que quedará
    // guardado (evita la sorpresa de "yo lo escribí en minúsculas").
    const value = e.target.value.toUpperCase();
    setForm((prev) => ({ ...prev, code: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="branch-form" noValidate>

      {/* ── Fila 1: Nombre + Código ── */}
      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor="bf-name">
            <Store size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Nombre de la sucursal
          </label>
          <input
            id="bf-name"
            type="text"
            className="input"
            placeholder="Ej.: Sucursal Norte"
            value={form.name}
            onChange={set('name')}
            required
            maxLength={100}
            autoComplete="off"
          />
        </div>

        <div className="form-field">
          <label htmlFor="bf-code">
            <Hash size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Código
          </label>
          <input
            id="bf-code"
            type="text"
            className="input branch-form-code-input"
            placeholder="Ej.: SUC-002"
            value={form.code}
            onChange={handleCodeChange}
            required
            maxLength={20}
            autoComplete="off"
          />
        </div>
      </div>

      {/* ── Fila 2: Dirección ── */}
      <div className="form-field">
        <label htmlFor="bf-address">
          <MapPin size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
          Dirección <span className="form-field-optional">(opcional)</span>
        </label>
        <input
          id="bf-address"
          type="text"
          className="input"
          placeholder="Ej.: Av. Principal #123, Zona Centro"
          value={form.address}
          onChange={set('address')}
          maxLength={255}
          autoComplete="off"
        />
      </div>

      {/* ── Fila 3: Teléfono + Zona horaria ── */}
      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor="bf-phone">
            <Phone size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Teléfono <span className="form-field-optional">(opcional)</span>
          </label>
          <input
            id="bf-phone"
            type="tel"
            className="input"
            placeholder="Ej.: +591 77777777"
            value={form.phone}
            onChange={set('phone')}
            maxLength={20}
            autoComplete="off"
          />
        </div>

        <div className="form-field">
          <label htmlFor="bf-timezone">
            <Clock size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Zona horaria
          </label>
          <select id="bf-timezone" className="input" value={form.timezone} onChange={set('timezone')}>
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Fila 4: Moneda + Impuesto ── */}
      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor="bf-currency">
            <Coins size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Moneda
          </label>
          <select id="bf-currency" className="input" value={form.currency} onChange={set('currency')}>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="bf-tax-rate">
            <Percent size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Impuesto (%)
          </label>
          <input
            id="bf-tax-rate"
            type="number"
            className="input"
            min={0}
            max={100}
            step="0.01"
            value={form.tax_rate}
            onChange={set('tax_rate')}
          />
        </div>
      </div>

      {/* ── Fila 5: Estado ── */}
      <label className="form-checkbox" htmlFor="bf-active">
        <input
          id="bf-active"
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
        />
        <CheckSquare size={14} strokeWidth={2} />
        Sucursal activa
      </label>

      {/* ── Configuración de recibo (avanzado, colapsable) ── */}
      <button
        type="button"
        className="branch-form-advanced-toggle"
        onClick={() => setShowReceiptSettings((v) => !v)}
        aria-expanded={showReceiptSettings}
      >
        <Receipt size={13} strokeWidth={2} />
        Configuración de recibo
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`branch-form-advanced-chevron ${showReceiptSettings ? 'is-open' : ''}`}
        />
      </button>

      {showReceiptSettings && (
        <div className="branch-form-advanced-panel">
          <div className="form-field">
            <label htmlFor="bf-receipt-header">Encabezado del recibo</label>
            <input
              id="bf-receipt-header"
              type="text"
              className="input"
              placeholder={form.name || 'Ej.: Restaurante Demo S.A.'}
              value={form.settings.receipt_header}
              onChange={setSetting('receipt_header')}
              maxLength={150}
            />
          </div>
          <div className="form-field">
            <label htmlFor="bf-receipt-footer">Pie del recibo</label>
            <input
              id="bf-receipt-footer"
              type="text"
              className="input"
              placeholder="Ej.: ¡Gracias por su preferencia!"
              value={form.settings.receipt_footer}
              onChange={setSetting('receipt_footer')}
              maxLength={255}
            />
          </div>
        </div>
      )}

      {/* ── Acción principal ── */}
      <button type="submit" className="form-submit-btn" disabled={saving}>
        {saving
          ? <>Guardando...</>
          : isEditing
            ? <><Save size={16} strokeWidth={2} /> Guardar cambios</>
            : <><Store size={16} strokeWidth={2} /> Crear sucursal</>
        }
      </button>
    </form>
  );
};

export default BranchForm;
