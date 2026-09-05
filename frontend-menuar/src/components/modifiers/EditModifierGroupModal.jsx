import React from 'react';
import { PlusCircle, Save } from 'lucide-react';
import FormModal from '../ui/FormModal';
import OptionRow from './OptionRow';
import useModifierGroupEditor from '../../hooks/useModifierGroupEditor';

/**
 * Modal para editar un grupo de opciones existente: sus datos (nombre,
 * descripción, mín/máx) y sus opciones individuales (agregar/editar/quitar),
 * por ejemplo quitar "Con leche de soya" de un grupo de bebidas.
 */
const EditModifierGroupModal = ({ modifier, onClose, onSaved }) => {
  const {
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
  } = useModifierGroupEditor(modifier, onSaved);

  const handleSaveGroup = async () => {
    const ok = await saveGroup();
    if (ok) onClose();
  };

  return (
    <FormModal title="Editar grupo de opciones" onClose={onClose}>
      <div className="form-field-row">
        <div className="form-field">
          <label>Nombre</label>
          <input type="text" className="input" value={form.name} onChange={(e) => setField('name', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Descripción</label>
          <input type="text" className="input" value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Mín selecciones</label>
          <input type="number" min="0" className="input" value={form.min_selections} onChange={(e) => setField('min_selections', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Máx selecciones</label>
          <input type="number" min="1" className="input" value={form.max_selections} onChange={(e) => setField('max_selections', e.target.value)} />
        </div>
      </div>

      <button type="button" onClick={handleSaveGroup} disabled={saving} className="form-submit-btn" style={{ marginBottom: 22 }}>
        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar datos del grupo'}
      </button>

      <h4 className="modifier-edit-options-title">Opciones de este grupo</h4>
      <div className="option-row-list" style={{ marginBottom: 14 }}>
        {options.map((opt) => (
          <OptionRow
            key={opt.id}
            name={opt.name}
            priceAdjustment={opt.price_adjustment}
            onNameChange={(v) => updateOptionField(opt.id, 'name', v)}
            onPriceChange={(v) => updateOptionField(opt.id, 'price_adjustment', v)}
            onSave={() => saveOption(opt)}
            onRemove={() => deleteOption(opt)}
          />
        ))}
        {options.length === 0 && <p className="modifiers-picker-empty">Este grupo no tiene opciones. Agrega una abajo.</p>}
      </div>

      <div className="option-row">
        <input
          type="text"
          className="input"
          placeholder="Nueva opción (ej: Con canela)"
          value={newOption.name}
          onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          className="input option-row-price"
          placeholder="+/- precio"
          value={newOption.price_adjustment}
          onChange={(e) => setNewOption({ ...newOption, price_adjustment: e.target.value })}
        />
        <button type="button" onClick={addOption} className="admin-action-btn admin-action-btn--on" title="Agregar opción">
          <PlusCircle size={15} />
        </button>
      </div>
    </FormModal>
  );
};

export default EditModifierGroupModal;
