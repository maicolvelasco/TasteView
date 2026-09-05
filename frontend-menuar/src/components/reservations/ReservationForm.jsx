import React, { useState } from 'react';
import { Save, User, Phone, Mail, Calendar, Clock, Users, Armchair, StickyNote, Loader2, AlertTriangle } from 'lucide-react';
import useAvailableTables from '../../hooks/useAvailableTables';

const toFormState = () => ({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  reservation_date: '',
  reservation_time: '',
  guests_count: 2,
  table_id: '',
  notes: '',
});

/** Formulario de nueva reserva. Sugiere mesas disponibles en vivo según fecha/hora/comensales. */
const ReservationForm = ({ onSave }) => {
  const [form, setForm] = useState(toFormState());
  const [saving, setSaving] = useState(false);
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const { tables, loading: loadingTables, error: tablesError } = useAvailableTables({
    date: form.reservation_date,
    time: form.reservation_time,
    guests: form.guests_count,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label><User size={12} /> Nombre del cliente *</label>
        <input
          type="text"
          className="input"
          placeholder="Ej: María Fernández"
          value={form.customer_name}
          onChange={(e) => setField('customer_name', e.target.value)}
          required
        />
      </div>

      <div className="form-field-row" style={{ marginBottom: 14 }}>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label><Phone size={12} /> Teléfono</label>
          <input
            type="tel"
            className="input"
            placeholder="Opcional"
            value={form.customer_phone}
            onChange={(e) => setField('customer_phone', e.target.value)}
          />
        </div>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label><Mail size={12} /> Email</label>
          <input
            type="email"
            className="input"
            placeholder="Opcional"
            value={form.customer_email}
            onChange={(e) => setField('customer_email', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-row" style={{ marginBottom: 14 }}>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label><Calendar size={12} /> Fecha *</label>
          <input
            type="date"
            className="input"
            value={form.reservation_date}
            onChange={(e) => setField('reservation_date', e.target.value)}
            required
          />
        </div>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label><Clock size={12} /> Hora *</label>
          <input
            type="time"
            className="input"
            value={form.reservation_time}
            onChange={(e) => setField('reservation_time', e.target.value)}
            required
          />
        </div>
        <div className="form-field" style={{ marginBottom: 0 }}>
          <label><Users size={12} /> Comensales *</label>
          <input
            type="number"
            min={1}
            max={50}
            className="input"
            value={form.guests_count}
            onChange={(e) => setField('guests_count', parseInt(e.target.value, 10) || '')}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label><Armchair size={12} /> Mesa (opcional)</label>
        <select className="input" value={form.table_id} onChange={(e) => setField('table_id', e.target.value)}>
          <option value="">Sin asignar todavía</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              Mesa {t.number} — {t.name} ({t.capacity} pers.)
            </option>
          ))}
        </select>
        {loadingTables && (
          <p className="reservation-form-hint">
            <Loader2 size={12} className="spin-icon" /> Buscando mesas disponibles...
          </p>
        )}
        {!loadingTables && tablesError && (
          <p className="reservation-form-hint reservation-form-hint--error">
            <AlertTriangle size={12} /> {tablesError}
          </p>
        )}
        {!loadingTables && !tablesError && form.reservation_date && form.reservation_time && tables.length === 0 && (
          <p className="reservation-form-hint reservation-form-hint--warning">
            No hay mesas disponibles para ese horario y número de comensales.
          </p>
        )}
      </div>

      <div className="form-field">
        <label><StickyNote size={12} /> Notas (opcional)</label>
        <textarea
          className="input"
          rows={2}
          placeholder="Alergias, ocasión especial, preferencias..."
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
        />
      </div>

      <button type="submit" className="form-submit-btn" disabled={saving}>
        <Save size={16} /> {saving ? 'Guardando...' : 'Crear Reserva'}
      </button>
    </form>
  );
};

export default ReservationForm;
