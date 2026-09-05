import { useState } from 'react';
import api from '../services/api';

/**
 * Encapsula el estado y las acciones de edición de UN grupo de opciones ya
 * existente: datos del grupo (nombre/descripción/mín/máx) y sus opciones
 * individuales (agregar, editar, quitar). Usado por el modal de edición en
 * la página de Modificadores.
 */
export default function useModifierGroupEditor(modifier, onSaved) {
  const [form, setForm] = useState({
    name: modifier.name || '',
    description: modifier.description || '',
    min_selections: modifier.min_selections ?? 0,
    max_selections: modifier.max_selections ?? 1,
  });
  const [options, setOptions] = useState((modifier.options || []).map((o) => ({ ...o })));
  const [newOption, setNewOption] = useState({ name: '', price_adjustment: '0' });
  const [saving, setSaving] = useState(false);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveGroup = async () => {
    setSaving(true);
    try {
      await api.put(`/modifiers/${modifier.id}`, {
        name: form.name,
        description: form.description,
        min_selections: parseInt(form.min_selections, 10) || 0,
        max_selections: parseInt(form.max_selections, 10) || 1,
      });
      await onSaved();
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateOptionField = (id, field, value) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const saveOption = async (option) => {
    try {
      await api.put(`/modifier-options/${option.id}`, {
        name: option.name,
        price_adjustment: parseFloat(option.price_adjustment) || 0,
      });
      await onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la opción');
    }
  };

  const deleteOption = async (option) => {
    if (!window.confirm(`¿Quitar la opción "${option.name}"?`)) return;
    try {
      await api.delete(`/modifier-options/${option.id}`);
      setOptions((prev) => prev.filter((o) => o.id !== option.id));
      await onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la opción');
    }
  };

  const addOption = async () => {
    if (!newOption.name.trim()) return;
    try {
      const res = await api.post(`/modifiers/${modifier.id}/options`, {
        name: newOption.name.trim(),
        price_adjustment: parseFloat(newOption.price_adjustment) || 0,
      });
      setOptions((prev) => [...prev, res.data.data]);
      setNewOption({ name: '', price_adjustment: '0' });
      await onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar la opción');
    }
  };

  return {
    form,
    setField,
    options,
    newOption,
    setNewOption,
    saving,
    saveGroup,
    updateOptionField,
    saveOption,
    deleteOption,
    addOption,
  };
}
