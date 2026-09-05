import React, { useState } from 'react';
import { Save, Hash, Tag, Users } from 'lucide-react';

const toFormState = (table) => ({
  number: table?.number || '',
  name: table?.name || '',
  capacity: table?.capacity || 4,
});

/** Formulario de crear/editar mesa. Si recibe `table`, la edita. */
const TableForm = ({ table, onSave }) => {
  const [form, setForm] = useState(toFormState(table));
  const [saving, setSaving] = useState(false);
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la mesa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label><Hash size={12} /> Número *</label>
        <input
          type="text"
          className="input"
          placeholder="Ej: 11"
          value={form.number}
          onChange={(e) => setField('number', e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label><Tag size={12} /> Nombre (opcional)</label>
        <input
          type="text"
          className="input"
          placeholder="Ej: Terraza 3, VIP C"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label><Users size={12} /> Capacidad</label>
        <input
          type="number"
          min="1"
          className="input"
          value={form.capacity}
          onChange={(e) => setField('capacity', e.target.value)}
        />
      </div>

      <button type="submit" className="form-submit-btn" disabled={saving}>
        <Save size={16} /> {saving ? 'Guardando...' : table ? 'Guardar Cambios' : 'Crear Mesa'}
      </button>
    </form>
  );
};

export default TableForm;
