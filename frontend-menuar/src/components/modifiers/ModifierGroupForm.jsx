import React, { useState } from 'react';
import { ListPlus, Save } from 'lucide-react';
import OptionRow from './OptionRow';

const emptyForm = () => ({
  name: '',
  description: '',
  min_selections: 0,
  max_selections: 1,
  options: [{ name: '', price_adjustment: '0' }],
});

/** Formulario de creación de un nuevo grupo de opciones (con sus opciones iniciales). */
const ModifierGroupForm = ({ onCreated }) => {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateOptionRow = (index, field, value) => {
    setForm((f) => {
      const options = [...f.options];
      options[index] = { ...options[index], [field]: value };
      return { ...f, options };
    });
  };

  const addOptionRow = () => setForm((f) => ({ ...f, options: [...f.options, { name: '', price_adjustment: '0' }] }));
  const removeOptionRow = (index) => setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanOptions = form.options
      .filter((o) => o.name.trim() !== '')
      .map((o) => ({ name: o.name.trim(), price_adjustment: parseFloat(o.price_adjustment) || 0 }));

    if (cleanOptions.length === 0) {
      alert('Agrega al menos una opción (ej: "Con papas", "Sin papas")');
      return;
    }

    setSaving(true);
    try {
      await onCreated({
        name: form.name,
        description: form.description || undefined,
        min_selections: parseInt(form.min_selections, 10) || 0,
        max_selections: parseInt(form.max_selections, 10) || 1,
        options: cleanOptions,
      });
      setForm(emptyForm());
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear el grupo de opciones');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field-row">
        <div className="form-field">
          <label>Nombre del grupo *</label>
          <input type="text" className="input" placeholder="Ej: Tipo de bebida" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Descripción (opcional)</label>
          <input type="text" className="input" value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field">
          <label>Selecciones mínimas (0 = opcional)</label>
          <input type="number" min="0" className="input" value={form.min_selections} onChange={(e) => setField('min_selections', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Selecciones máximas (1 = elegir solo una)</label>
          <input type="number" min="1" className="input" value={form.max_selections} onChange={(e) => setField('max_selections', e.target.value)} />
        </div>
      </div>

      <div className="form-field">
        <label>Opciones iniciales (después puedes agregar, editar o quitar más con "Editar")</label>
        <div className="option-row-list">
          {form.options.map((opt, i) => (
            <OptionRow
              key={i}
              name={opt.name}
              priceAdjustment={opt.price_adjustment}
              onNameChange={(v) => updateOptionRow(i, 'name', v)}
              onPriceChange={(v) => updateOptionRow(i, 'price_adjustment', v)}
              onRemove={() => removeOptionRow(i)}
            />
          ))}
        </div>
        <button type="button" onClick={addOptionRow} className="admin-action-btn admin-action-btn--duplicate" style={{ marginTop: 8 }}>
          <ListPlus size={13} /> Agregar opción
        </button>
      </div>

      <button type="submit" className="form-submit-btn" disabled={saving}>
        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar grupo de opciones'}
      </button>
    </form>
  );
};

export default ModifierGroupForm;
