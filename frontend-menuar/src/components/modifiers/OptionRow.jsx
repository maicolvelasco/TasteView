import React from 'react';
import { Check, Trash2 } from 'lucide-react';

/**
 * Fila de una opción (nombre + ajuste de precio). Se usa tanto al crear un
 * grupo nuevo (sin guardar aún, `onSave` ausente) como al editar un grupo
 * existente (cada fila se guarda individualmente con `onSave`).
 */
const OptionRow = ({ name, priceAdjustment, onNameChange, onPriceChange, onSave, onRemove }) => (
  <div className="option-row">
    <input
      type="text"
      className="input"
      placeholder="Nombre de la opción"
      value={name}
      onChange={(e) => onNameChange(e.target.value)}
    />
    <input
      type="number"
      step="0.01"
      className="input option-row-price"
      placeholder="+/- precio"
      value={priceAdjustment}
      onChange={(e) => onPriceChange(e.target.value)}
    />
    {onSave && (
      <button type="button" className="option-row-btn option-row-btn--save" onClick={onSave} title="Guardar">
        <Check size={15} />
      </button>
    )}
    <button type="button" className="option-row-btn option-row-btn--remove" onClick={onRemove} title="Quitar">
      <Trash2 size={15} />
    </button>
  </div>
);

export default OptionRow;
