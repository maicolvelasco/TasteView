import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';

const EMOJI_PRESETS = ['🍽️', '🥗', '🍲', '🥩', '🍝', '🍰', '🍹', '☕', '🍕', '🍔', '🌮', '🍣', '🍜', '🥪', '🍦'];

const toFormState = (category) => ({
  name: category?.name || '',
  description: category?.description || '',
  icon: category?.icon || '🍽️',
});

/** Formulario de crear/editar categoría. Si recibe `category`, la edita. */
const CategoryForm = ({ category, onSave }) => {
  const [form, setForm] = useState(toFormState(category));
  const [saving, setSaving] = useState(false);
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Ícono</label>
        <div className="category-emoji-picker">
          {EMOJI_PRESETS.map((emoji) => (
            <motion.button
              key={emoji}
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              className={`category-emoji-option ${form.icon === emoji ? 'active' : ''}`}
              onClick={() => setField('icon', emoji)}
            >
              {emoji}
            </motion.button>
          ))}
          <input
            type="text"
            className="input category-emoji-custom"
            value={form.icon}
            onChange={(e) => setField('icon', e.target.value)}
            maxLength={4}
            aria-label="Ícono personalizado"
          />
        </div>
      </div>

      <div className="form-field">
        <label>Nombre de la categoría *</label>
        <input
          type="text"
          className="input"
          placeholder="Ej: Entradas"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label>Descripción (opcional)</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Breve descripción de la categoría"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
        />
      </div>

      <button type="submit" className="form-submit-btn" disabled={saving}>
        <Save size={16} /> {saving ? 'Guardando...' : category ? 'Guardar Cambios' : 'Crear Categoría'}
      </button>
    </form>
  );
};

export default CategoryForm;
